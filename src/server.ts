/* eslint-disable no-console */
import chalk from "chalk";
import { Server } from "http";
import mongoose from "mongoose";

import app from "./app";
import config from "./app/config";

let server: Server;

// ===== Catch synchronous errors =====
process.on("uncaughtException", (error: Error) => {
  console.error(chalk.red("😈 UNCAUGHT EXCEPTION! Shutting down immediately..."));
  console.error(chalk.red("Name:"), error.name);
  console.error(chalk.red("Message:"), error.message);
  console.error(chalk.red("Stack:"), error.stack);
  process.exit(1);
});

// ===== Graceful Shutdown Helper =====
async function gracefulShutdown(signal: string, exitCode: number = 0) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error(chalk.red("❌ Error closing HTTP server:"), err);
        process.exit(1);
      }

      console.log(chalk.yellow("🔴 HTTP server closed"));

      try {
        await mongoose.connection.close(false);
        console.log(chalk.green("🍃 MongoDB connection closed"));
        console.log(chalk.green("✅ Graceful shutdown completed"));
        process.exit(exitCode);
      } catch (error) {
        console.error(chalk.red("❌ Error during database shutdown:"), error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error(chalk.yellow("⚠️ Forced shutdown after 30s timeout"));
      process.exit(1);
    }, 30000);
  } else {
    try {
      await mongoose.connection.close(false);
      console.log(chalk.yellow("🍃 MongoDB connection closed"));
    } catch (error) {
      console.error(chalk.red("❌ Error closing database:"), error);
    }
    process.exit(exitCode);
  }
}

async function main() {
  try {
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      compressors: ["zlib"],
      family: 4,
    });

    console.log(chalk.green("🍃 MongoDB connected successfully"));
    console.log(chalk.green(`🌍 Environment: ${config.NODE_ENV}`));
    console.log(chalk.green(`🗄️  Database: ${mongoose.connection.name}`));

    server = app.listen(config.port, () => {
      console.log(chalk.green(`🚀 Application is running on port ${config.port}`));
    });

    // MongoDB connection event handlers
    mongoose.connection.on("error", (err) => {
      console.error(chalk.red("🍃 MongoDB connection error:"), err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(chalk.yellow("⚠️ MongoDB disconnected. Attempting to reconnect..."));
    });

    mongoose.connection.on("reconnected", () => {
      console.log(chalk.green("✅ MongoDB reconnected successfully"));
    });

    mongoose.connection.on("close", () => {
      console.log(chalk.green("🍃 MongoDB connection closed"));
    });
  } catch (error) {
    console.error(chalk.red("💥 Failed to start application:"), error);
    process.exit(1);
  }
}

main();

// ===== Process Signal Handlers =====
process.on("unhandledRejection", (reason: Error) => {
  console.error(chalk.red("😈 UNHANDLED REJECTION! Shutting down..."));
  console.error(chalk.red("Reason:"), reason.name, reason.message);
  gracefulShutdown("unhandledRejection", 1);
});

process.on("SIGTERM", () => {
  console.log(chalk.yellow("👋 SIGTERM signal received"));
  gracefulShutdown("SIGTERM", 0);
});

process.on("SIGINT", () => {
  console.log(chalk.yellow("👋 SIGINT signal received (Ctrl+C)"));
  gracefulShutdown("SIGINT", 0);
});
