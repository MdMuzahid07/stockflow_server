import { z } from "zod";

/**
 * Category creation validation schema
 */
export const createCategoryValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .max(50, "Category name must not exceed 50 characters")
      .trim(),
  }),
});

/**
 * Category update validation schema
 */
export const updateCategoryValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .max(50, "Category name must not exceed 50 characters")
      .trim()
      .optional(),
  }),
});
