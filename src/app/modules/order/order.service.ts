import httpStatus from "http-status";
import mongoose from "mongoose";

import QueryBuilder from "../../builder/QueryBuilder";
import CustomAppError from "../../errors/CustomAppError";
import ProductModel from "../product/product.model";
import { IOrder, OrderStatus } from "./order.interface";
import OrderModel from "./order.model";

/**
 * Creates a new order with stock validation and adjustment.
 * Uses a Mongoose transaction to ensure atomicity.
 * @param {Partial<IOrder>} payload - The order data.
 * @returns {Promise<IOrder>} The created order.
 */
const createOrder = async (payload: Partial<IOrder>): Promise<IOrder> => {
  const { items } = payload;

  if (!items || items.length === 0) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Order items are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;

    // 1. Validate and Update Stock for each item
    for (const item of items) {
      const product = await ProductModel.findById(item.product).session(session);

      if (!product) {
        throw new CustomAppError(httpStatus.NOT_FOUND, `Product not found: ${item.product}`);
      }

      if (product.isDeleted) {
        throw new CustomAppError(httpStatus.BAD_REQUEST, `Product is no longer available: ${product.name}`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new CustomAppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        );
      }

      // Reduce stock
      product.stockQuantity -= item.quantity;
      await product.save({ session });

      // Calculate total (using unit price from payload or product - ideally product for security)
      // Here we use unit price from payload but we could also fetch from product
      totalAmount += item.unitPrice * item.quantity;
    }

    // 2. Create Order
    const orderData = {
      ...payload,
      totalAmount,
      status: "pending" as OrderStatus,
    };

    const [newOrder] = await OrderModel.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    return newOrder;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Retrieves all orders with advanced filtering, searching, sorting, and pagination.
 */
const getAllOrders = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(OrderModel.find().populate("items.product"), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, data };
};

/**
 * Retrieves a single order by its ID.
 */
const getOrderById = async (id: string): Promise<IOrder> => {
  const order = await OrderModel.findOne({ _id: id, isDeleted: false }).populate("items.product");
  if (!order) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Order not found");
  }
  return order;
};

/**
 * Updates the status of an order and handles stock restoration if cancelled.
 */
const updateOrderStatus = async (id: string, status: OrderStatus): Promise<IOrder | null> => {
  const order = await OrderModel.findOne({ _id: id, isDeleted: false });
  if (!order) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // If already delivered or cancelled, don't allow changes (depends on business logic)
  if (order.status === "cancelled") {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Cannot update a cancelled order");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Handle Stock Restoration on Cancellation
    if (status === "cancelled") {
      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(
          item.product,
          { $inc: { stockQuantity: item.quantity } },
          { session }
        );
      }
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return updatedOrder;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Performs a soft delete on an order.
 */
const deleteOrder = async (id: string): Promise<{ message: string }> => {
  const order = await OrderModel.findOne({ _id: id, isDeleted: false });
  if (!order) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Order not found");
  }

  order.isDeleted = true;
  await order.save();

  return { message: "Order deleted successfully" };
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};

export default OrderService;
