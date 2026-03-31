import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/send.response";
import { DashboardService } from "./dashboard.service";

/**
 * Controller for retrieving dashboard statistics
 */
const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

/**
 * Controller for retrieving dashboard analytics (last 7 days sparkline)
 */
const getAnalyticsData = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAnalyticsData();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard analytics retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getStats,
  getAnalyticsData,
};
