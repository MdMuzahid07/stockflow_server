/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";

import QueryBuilder from "../../builder/QueryBuilder";
import CustomAppError from "../../errors/CustomAppError";
import ActivityLogService from "../activityLog/activityLog.service";
import ProductModel from "../product/product.model";
import { IRestock, RestockPriority } from "./restock.interface";
import RestockModel from "./restock.model";

/**
 * Automatically detects low stock and adds/updates the Restock Queue.
 * Called whenever a product's stock changes.
 */
const handleLowStockDetection = async (
  productId: string,
  currentStock: number,
  threshold: number,
  session?: mongoose.ClientSession
) => {
  if (currentStock < threshold) {
    // Calculate Priority
    let priority: RestockPriority = "Low";
    if (currentStock === 0) {
      priority = "High";
    } else if (currentStock <= threshold / 2) {
      priority = "Medium";
    }

    // Check if already in pending queue
    const existingEntry = await RestockModel.findOne({
      product: productId,
      status: "pending",
    }).session(session as any);

    if (existingEntry) {
      // Update existing entry
      existingEntry.currentStock = currentStock;
      existingEntry.priority = priority;
      await existingEntry.save({ session });
    } else {
      // Add to queue
      await RestockModel.create(
        [
          {
            product: productId,
            currentStock,
            threshold,
            priority,
            status: "pending",
          },
        ],
        { session }
      );

      // Log activity
      await ActivityLogService.createLog({
        action: `Product added to Restock Queue due to low stock`,
        type: "system",
      });
    }
  } else {
    // If stock is now above threshold, mark any pending restock as completed (or delete)
    await RestockModel.findOneAndUpdate(
      { product: productId, status: "pending" },
      { status: "completed" },
      { session }
    );
  }
};

/**
 * Retrieves the pending restock queue with filtering and sorting.
 */
const getPendingQueue = async (query: Record<string, unknown>) => {
  const restockQuery = new QueryBuilder(
    RestockModel.find({ status: "pending" }).populate("product"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await restockQuery.modelQuery;
  const meta = await restockQuery.countTotal();

  return { meta, data };
};

/**
 * Executes a restock action: updates product stock and completes the queue item.
 */
const executeRestock = async (
  queueId: string,
  addedStock: number,
  userId: string
): Promise<IRestock | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const queueItem = await RestockModel.findById(queueId).populate("product").session(session);

    if (!queueItem || queueItem.status === "completed") {
      throw new CustomAppError(httpStatus.NOT_FOUND, "Restock item not found or already completed");
    }

    // 1. Update Product Stock
    const product = await ProductModel.findByIdAndUpdate(
      queueItem.product,
      {
        $inc: { stockQuantity: addedStock },
        status: "active", // Ensure it's active after restocking
      },
      { session, new: true }
    );

    if (!product) {
      throw new CustomAppError(httpStatus.NOT_FOUND, "Associated product not found");
    }

    // 2. Mark Queue Item as Completed
    queueItem.status = "completed";
    queueItem.currentStock = product.stockQuantity;
    await queueItem.save({ session });

    // 3. Log Activity
    await ActivityLogService.createLog({
      action: `Restocked ${addedStock} units for "${product.name}"`,
      user: userId,
      type: "stock",
    });

    await session.commitTransaction();
    session.endSession();

    return queueItem;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const RestockService = {
  handleLowStockDetection,
  getPendingQueue,
  executeRestock,
};

export default RestockService;
