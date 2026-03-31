import { Request, Response } from "express";

import app from "../app";
import connectDB from "../app/utils/dbConnect";

export default async (req: Request, res: Response) => {
  await connectDB();
  return app(req, res);
};
