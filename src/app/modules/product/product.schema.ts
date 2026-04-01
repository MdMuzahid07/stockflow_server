import { Schema } from "mongoose";

import { IProduct, IProductModel } from "./product.interface";

const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name must not exceed 100 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be at least 0"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity must be at least 0"],
    },
    minThreshold: {
      type: Number,
      required: [true, "Minimum threshold is required"],
      min: [0, "Minimum threshold must be at least 0"],
      default: 5,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    status: {
      type: String,
      enum: ["active", "out-of-stock"],
      default: "active",
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
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isDeleted: 1 });

// ===== Pre-save Middleware =====
productSchema.pre("save", function () {
  // Automatically update status based on stockQuantity
  if (this.stockQuantity === 0) {
    this.status = "out-of-stock";
  } else if (this.stockQuantity > 0 && this.status === "out-of-stock") {
    this.status = "active";
  }
});

// ===== Pre-findOneAndUpdate Middleware =====
productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as any;

  if (update?.stockQuantity === 0) {
    update.status = "out-of-stock";
  } else if (update?.stockQuantity > 0) {
    update.status = "active";
  }
});

// ===== Query Middleware =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
productSchema.pre(/^find/, function (this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export default productSchema;
