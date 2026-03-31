import httpStatus from "http-status";

import CustomAppError from "../../errors/CustomAppError";
import CategoryModel from "./category.model";

/**
 * Create a new category
 */
const createCategory = async (payload: { name: string }) => {
  // Check if category name is already taken
  // Use case-insensitive search
  const existingCategory = await CategoryModel.findOne({
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    isDeleted: false,
  });

  if (existingCategory) {
    throw new CustomAppError(httpStatus.CONFLICT, "Category already exists");
  }

  const category = await CategoryModel.create(payload);
  return category;
};

/**
 * Get all categories
 */
const getAllCategories = async () => {
  const categories = await CategoryModel.find({ isDeleted: false });
  return categories;
};

/**
 * Get a single category by ID
 */
const getCategoryById = async (id: string) => {
  const category = await CategoryModel.findOne({ _id: id, isDeleted: false });
  if (!category) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

/**
 * Update a category
 */
const updateCategory = async (id: string, payload: { name: string }) => {
  // Check if target category exists
  const category = await CategoryModel.findOne({ _id: id, isDeleted: false });
  if (!category) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Check if new name is already taken by another category
  if (payload.name) {
    const isNameTaken = await CategoryModel.isCategoryNameTaken(payload.name, id);
    if (isNameTaken) {
      throw new CustomAppError(httpStatus.CONFLICT, "Another category with this name already exists");
    }
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedCategory;
};

/**
 * Soft delete a category
 */
const deleteCategory = async (id: string) => {
  const category = await CategoryModel.findOne({ _id: id, isDeleted: false });
  if (!category) {
    throw new CustomAppError(httpStatus.NOT_FOUND, "Category not found");
  }

  category.isDeleted = true;
  await category.save();

  return { message: "Category deleted successfully" };
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
