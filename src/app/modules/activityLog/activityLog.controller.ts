import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/send.response";
import { ActivityLogService } from "./activityLog.service";

/**
 * Controller for retrieving recent activity logs
 */
const getRecentLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogService.getRecentLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent activity logs retrieved successfully",
    data: result,
  });
});

export const ActivityLogController = {
  getRecentLogs,
};
