import { z } from "zod";

/**
 * Order item validation schema
 */
const orderItemValidationSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be at least 0"),
});

/**
 * Order creation validation schema
 */
export const createOrderValidation = z.object({
  body: z.object({
    customer: z.object({
      name: z.string().min(1, "Customer name is required").trim(),
      phone: z.string().min(1, "Customer phone is required").trim(),
      address: z.string().min(1, "Customer address is required").trim(),
    }),
    items: z.array(orderItemValidationSchema).min(1, "At least one item is required"),
  }),
});

/**
 * Order status update validation schema
 */
export const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum(["pending", "shipped", "delivered", "cancelled"]),
  }),
});
