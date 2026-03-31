import { z } from "zod";

/**
 * Product creation validation schema
 */
export const createProductValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name must not exceed 100 characters")
      .trim(),
    category: z.string().min(1, "Category ID is required"),
    price: z.number().min(0, "Price must be at least 0"),
    stockQuantity: z.number().int().min(0, "Stock quantity must be a non-negative integer"),
    minThreshold: z.number().int().min(0, "Minimum threshold must be a non-negative integer"),
    image: z.string().url("Valid image URL is required"),
  }),
});

/**
 * Product update validation schema
 */
export const updateProductValidation = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name must not exceed 100 characters")
      .trim()
      .optional(),
    category: z.string().optional(),
    price: z.number().min(0, "Price must be at least 0").optional(),
    stockQuantity: z.number().int().min(0, "Stock quantity must be at least 0").optional(),
    minThreshold: z.number().int().min(0, "Minimum threshold must be at least 0").optional(),
    image: z.string().url("Valid image URL is required").optional(),
    status: z.enum(["active", "out-of-stock"]).optional(),
  }),
});
