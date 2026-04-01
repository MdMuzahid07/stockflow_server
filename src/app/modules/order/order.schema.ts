import { Schema } from "mongoose";

import { IOrder, IOrderItem } from "./order.interface";

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: [true, "Unit price is required"],
    min: [0, "Unit price must be at least 0"],
  },
});

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
      },
      address: {
        type: String,
        required: [true, "Customer address is required"],
        trim: true,
      },
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: [(val: IOrderItem[]) => val.length > 0, "Order must have at least one item"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be at least 0"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
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
orderSchema.index({ status: 1 });
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ createdAt: -1 });

// ===== Query Middleware =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
orderSchema.pre(/^find/, function (this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export default orderSchema;
