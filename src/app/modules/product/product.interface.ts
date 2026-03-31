import { Document, Model, Types } from "mongoose";

export type ProductStatus = "active" | "out-of-stock";

/**
 * Product Interface
 * Defines the structure of a product document in MongoDB
 */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  category: Types.ObjectId;
  price: number;
  stockQuantity: number;
  minThreshold: number;
  image: string;
  status: ProductStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Model Interface
 * Extends the Mongoose Model with custom static methods if needed
 */
export interface IProductModel extends Model<IProduct> {
  // Add static methods here if needed
}
