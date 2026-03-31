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
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
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
    rememberMe: z.boolean().optional().default(false),
  }),
});

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

/**
 * Resend Verification Email Validation Schema
 */
export const resendVerificationValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

/**
 * Reset Password Validation Schema
 */
export const resetPasswordValidationSchema = z.object({
  body: z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
  params: z.object({
    token: z.string().min(1, "Reset token is required"),
  }),
});

/**
 * Email Verification Validation Schema
 */
export const verifyEmailValidationSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

/**
 * Google OAuth Validation Schema
 */
export const googleOAuthValidationSchema = z.object({
  body: z.object({
    credential: z.string().min(1, "Google credential is required"),
  }),
});

/**
 * Refresh Token Validation Schema
 */
export const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

/**
 * Update Profile Validation Schema
 */
export const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim()
      .optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
  }),
});

/**
 * Change Password Validation Schema
 */
export const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirm new password is required"),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  }).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }),
});
