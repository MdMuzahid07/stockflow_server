import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
  try {
    const [{ default: app }, { default: connectDB }] = await Promise.all([
      import("../app"),
      import("../app/utils/dbConnect"),
    ]);

    await connectDB();
    return app(req, res);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server initialization failed",
      error: error?.message || "Unknown error",
    });
  }
};
