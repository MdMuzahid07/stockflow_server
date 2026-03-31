import { z } from "zod";

/**
 * Password validation schema
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Email validation schema
 */
const emailSchema = z.string().email("Invalid email address").toLowerCase();

/**
 * User Registration Validation Schema
 */
export const registerValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters")
        .trim(),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Confirm password is required"),
      role: z.enum(["admin", "manager"]).optional().default("manager"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

/**
 * User Login Validation Schema
 */
export const loginValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});
