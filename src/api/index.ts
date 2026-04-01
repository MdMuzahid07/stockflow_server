import { Request, Response } from "express";

import app from "../app";
import connectDB from "../app/utils/dbConnect";

export default async (req: Request, res: Response) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error?.message || "Unknown error",
    });
  }
};
