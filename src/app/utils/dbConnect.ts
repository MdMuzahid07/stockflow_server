import mongoose from "mongoose";

import config from "../config";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};
const color = {
  green: (message: string): string => `\x1b[32m${message}\x1b[0m`,
  red: (message: string): string => `\x1b[31m${message}\x1b[0m`,
};

async function connectDB(): Promise<void> {
  // Return if already connected
  if (connection.isConnected === 1) {
    console.log(color.green("Using existing MongoDB connection"));
    return;
  }

  // Check mongoose connection state
  if (mongoose.connection.readyState === 1) {
    connection.isConnected = 1;
    console.log(color.green("MongoDB already connected"));
    return;
  }

  try {
    // Fail fast in serverless instead of buffering model operations.
    mongoose.set("bufferCommands", false);

    const db = await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 10000, // Increase to 10s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      family: 4,
      maxPoolSize: 10, // Add connection pooling
      dbName: config.database_name,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log(color.green("✅ MongoDB Connected Successfully"));
  } catch (error) {
    console.error(color.red("❌ MongoDB connection error:"), error);
    throw error;
  }
}

export default connectDB;
