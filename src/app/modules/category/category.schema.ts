import { Schema } from "mongoose";

import { ICategory, ICategoryModel } from "./category.interface";

const categorySchema = new Schema<ICategory, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name must not exceed 50 characters"],
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
categorySchema.index({ name: 1 });
categorySchema.index({ isDeleted: 1 });

// ===== Static Methods =====
categorySchema.statics.isCategoryNameTaken = async function (
  name: string,
  excludeId?: string
): Promise<boolean> {
  const category = await this.findOne({
    name,
    _id: { $ne: excludeId },
    isDeleted: false,
  });
  return !!category;
};

// ===== Query Middleware =====
categorySchema.pre(/^find/, function (this: any, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export default categorySchema;
