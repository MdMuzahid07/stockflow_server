import { Schema } from "mongoose";

import { IRestock } from "./restock.interface";

const restockSchema = new Schema<IRestock>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    currentStock: {
      type: Number,
      required: [true, "Current stock is required"],
    },
    threshold: {
      type: Number,
      required: [true, "Threshold is required"],
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: [true, "Restock priority is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ===== Indexes =====
// Sort queue by priority and stock quantity
restockSchema.index({ status: 1, currentStock: 1 });
restockSchema.index({ product: 1, status: 1 });

// ===== Query Middleware =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
restockSchema.pre(/^find/, function (this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export default restockSchema;
