import httpStatus from "http-status";

import QueryBuilder from "../../builder/QueryBuilder";
import CustomAppError from "../../errors/CustomAppError";
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
  return product;
};

/**
 * Retrieves all products with advanced filtering, searching, sorting, and pagination.
 * @param {Record<string, unknown>} query - The query parameters.
 * @returns {Promise<{ meta: any; data: IProduct[] }>} The paginated product data and metadata.
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

  return {
    meta,
    data,
  };
};

/**
 * Retrieves a single product by its ID.
 * @param {string} id - The product ID.
 * @returns {Promise<IProduct>} The product document.
 * @throws {CustomAppError} If the product is not found.
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
 * @returns {Promise<IProduct[]>} A list of low stock products.
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
 * Updates a product's information.
 * @param {string} id - The product ID.
 * @param {Partial<IProduct>} payload - The data to update.
 * @returns {Promise<IProduct | null>} The updated product.
 * @throws {CustomAppError} If the product is not found.
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

  return updatedProduct;
};

/**
 * Performs a soft delete on a product.
 * @param {string} id - The product ID.
 * @returns {Promise<{ message: string }>} Success message.
 * @throws {CustomAppError} If the product is not found.
 */
const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const product = await ProductModel.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Product not found or already deleted");
  }

  product.isDeleted = true;
  await product.save();

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
