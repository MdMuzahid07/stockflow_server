import chalk from "chalk";
import mongoose from "mongoose";

import config from "../config";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log(chalk.green("Using existing MongoDB connection (cached)"));
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(chalk.yellow("Creating new MongoDB connection..."));
    const opts = {
      serverSelectionTimeoutMS: 5000, // Fail fast in serverless
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      family: 4,
      maxPoolSize: 10,
      bufferCommands: false, // Turn off buffering to fail fast if disconnected!
    };

    cached.promise = mongoose.connect(config.database_url as string, opts).then((mongoose) => {
      console.log(chalk.green("✅ MongoDB Connected Successfully"));
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(chalk.red("❌ MongoDB connection error:"), e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
