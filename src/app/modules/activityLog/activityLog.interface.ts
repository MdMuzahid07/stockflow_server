import { Document, Types } from "mongoose";

export type ActivityLogType = "order" | "product" | "stock" | "auth" | "system";

/**
 * Activity Log Interface
 * Defines the structure of an activity log document in MongoDB
 */
export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  action: string;
  user?: Types.ObjectId;
  type: ActivityLogType;
  createdAt: Date;
  updatedAt: Date;
}
