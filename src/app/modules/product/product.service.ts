import httpStatus from "http-status";

import QueryBuilder from "../../builder/QueryBuilder";
import CustomAppError from "../../errors/CustomAppError";
import ActivityLogService from "../activityLog/activityLog.service";
import RestockService from "../restock/restock.service";
import { productSearchableFields } from "./product.constant";
import { IProduct } from "./product.interface";
import ProductModel from "./product.model";

/**
 * Creates a new product.
 * @param {Partial<IProduct>} payload - The product data to create.
 * @returns {Promise<IProduct>} The created product.
 */
const createProduct = async (payload: Partial<IProduct>): Promise<IProduct> => {
  const isExist = await ProductModel.findOne({ name: payload.name, isDeleted: false });
  if (isExist) {
    throw new CustomAppError(httpStatus.CONFLICT, "Product with this name already exists");
  }

  const product = await ProductModel.create(payload);

  // Log activity
  await ActivityLogService.createLog({
    action: `Product "${product.name}" created`,
    type: "product",
  });

  // Check for initial low stock
  if (product.stockQuantity < product.minThreshold) {
    await RestockService.handleLowStockDetection(
      product._id.toString(),
      product.stockQuantity,
      product.minThreshold
    );
  }

  return product;
};

/**
 * Retrieves all products with advanced filtering, searching, sorting, and pagination.
 */
const getAllProducts = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(ProductModel.find().populate("category"), query)
    .search(productSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, data };
};

/**
 * Retrieves a single product by its ID.
 */
const getProductById = async (id: string): Promise<IProduct> => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false }).populate("category");
  if (!product) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return product;
};

/**
 * Retrieves products that have stock less than or equal to their minimum threshold.
 */
const getLowStockProducts = async (): Promise<IProduct[]> => {
  const products = await ProductModel.find({
    isDeleted: false,
    $expr: { $lte: ["$stockQuantity", "$minThreshold"] },
  })
    .populate("category")
    .sort({ stockQuantity: 1 });

  return products;
};

/**
 * Updates a product's information and triggers low-stock detection if needed.
 */
const updateProduct = async (id: string, payload: Partial<IProduct>): Promise<IProduct | null> => {
  const isExist = await ProductModel.findOne({ _id: id, isDeleted: false });
  if (!isExist) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Product not found or already deleted");
  }

  const updatedProduct = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (updatedProduct) {
    // Log if stock changed
    if (payload.stockQuantity !== undefined) {
      await ActivityLogService.createLog({
        action: `Stock updated for "${updatedProduct.name}" to ${updatedProduct.stockQuantity}`,
        type: "stock",
      });
    }

    // Trigger low-stock detection
    await RestockService.handleLowStockDetection(
      updatedProduct._id.toString(),
      updatedProduct.stockQuantity,
      updatedProduct.minThreshold
    );
  }

  return updatedProduct;
};

/**
 * Performs a soft delete on a product.
 */
const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Product not found or already deleted");
  }

  product.isDeleted = true;
  await product.save();

  // Log activity
  await ActivityLogService.createLog({
    action: `Product "${product.name}" deleted`,
    type: "product",
  });

  return { message: "Product deleted successfully" };
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  getLowStockProducts,
  updateProduct,
  deleteProduct,
};

export default ProductService;
