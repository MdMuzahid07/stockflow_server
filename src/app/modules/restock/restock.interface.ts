import { Document, Types } from "mongoose";

export type RestockPriority = "High" | "Medium" | "Low";
export type RestockStatus = "pending" | "completed";

/**
 * Restock Interface
 * Structure for items in the replenishment queue
 */
export interface IRestock extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  currentStock: number;
  threshold: number;
  priority: RestockPriority;
  status: RestockStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
