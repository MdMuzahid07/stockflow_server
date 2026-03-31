import { Document, Model, Types } from "mongoose";

/**
 * Category Interface
 * Defines the structure of a category document in MongoDB
 */
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Model Interface
 * Extends the Mongoose Model with custom static methods
 */
export interface ICategoryModel extends Model<ICategory> {
  /**
   * Check if category name is already taken
   * @param name - Category name to check
   * @param excludeId - Optional category ID to exclude from check (for updates)
   * @returns Promise<boolean>
   */
  isCategoryNameTaken(name: string, excludeId?: string): Promise<boolean>;
}
