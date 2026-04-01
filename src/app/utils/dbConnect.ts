import chalk from "chalk";
import mongoose from "mongoose";

import config from "../config";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectDB(): Promise<void> {
  // Return if already connected
  if (connection.isConnected === 1) {
    console.log(chalk.green("Using existing MongoDB connection"));
    return;
  }

  // Check mongoose connection state
  if (mongoose.connection.readyState === 1) {
    connection.isConnected = 1;
    console.log(chalk.green("MongoDB already connected"));
    return;
  }

  try {
    const db = await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 10000, // Increase to 10s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      family: 4,
      maxPoolSize: 10, // Add connection pooling
    });

    connection.isConnected = db.connections[0].readyState;
    console.log(chalk.green("✅ MongoDB Connected Successfully"));
  } catch (error) {
    console.error(chalk.red("❌ MongoDB connection error:"), error);
    throw error;
  }
}

export default connectDB;
