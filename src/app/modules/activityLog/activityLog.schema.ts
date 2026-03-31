import { Schema } from "mongoose";

import { IActivityLog } from "./activityLog.interface";

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      required: [true, "Action message is required"],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // system actions might not have a specific user
    },
    type: {
      type: String,
      enum: ["order", "product", "stock", "auth", "system"],
      required: [true, "Action type is required"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need created at for logs
    versionKey: false,
  }
);

// ===== Indexes =====
// Index for sorting by createdAt (Dashboard use case)
activityLogSchema.index({ createdAt: -1 });

export default activityLogSchema;
