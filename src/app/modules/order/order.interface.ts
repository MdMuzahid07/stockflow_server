import { Document, Types } from "mongoose";

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

/**
 * Order Item Interface
 * Individual product details within an order
 */
export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

/**
 * Order Interface
 * Defines the structure of an order document in MongoDB
 */
export interface IOrder extends Document {
  _id: Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
