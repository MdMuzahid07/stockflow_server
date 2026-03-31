import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/send.response";
import { RestockService } from "./restock.service";

/**
 * Controller for retrieving the pending restock queue
 */
const getPendingQueue = catchAsync(async (req: Request, res: Response) => {
  const result = await RestockService.getPendingQueue(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Restock queue retrieved successfully",
    data: result,
  });
});

/**
 * Controller for executing a restock action
 */
const executeRestock = catchAsync(async (req: Request, res: Response) => {
  const { addedStock } = req.body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = req.user as any;
  const result = await RestockService.executeRestock(req.params.id, addedStock, user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product restocked successfully",
    data: result,
  });
});

export const RestockController = {
  getPendingQueue,
  executeRestock,
};
