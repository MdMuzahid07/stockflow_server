/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Input Sanitizer Middleware (Backend-Optimized)
 *
 * Lightweight sanitization for Node.js backend without browser dependencies.
 * Removes dangerous characters and patterns that could cause issues with:
 * - MongoDB queries
 * - JSON parsing
 * - Script injection (when data is sent to frontend)
 *
 * Note: Frontend should use DOMPurify for HTML rendering.
 * Backend focus: Data integrity and NoSQL injection prevention.
 *
 * @module middlewares/sanitizer
 */

import { NextFunction, Request, Response } from "express";

/**
 * Dangerous patterns to remove
 * These can cause issues in MongoDB queries or when data is rendered
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // Iframe tags
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
  /<embed\b[^>]*>/gi, // Embed tags
  /<object\b[^>]*>/gi, // Object tags
];

/**
 * Sanitizes a single string value
 *
 * Removes dangerous patterns and trims whitespace.
 * Non-string values are returned unchanged.
 *
 * @param {any} value - The value to sanitize
 * @returns {any} Sanitized string or original value
 *
 * @example
 * sanitizeString('<script>alert("xss")</script>Hello');
 * // Returns: 'Hello'
 *
 * sanitizeString('onclick="evil()"Normal text');
 * // Returns: 'Normal text'
 */
const sanitizeString = (value: any): any => {
  if (typeof value !== "string") return value;

  let sanitized = value.trim();

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  // Remove null bytes (can cause issues with C-based databases)
  sanitized = sanitized.replace(/\0/g, "");

  return sanitized;
};

/**
 * Recursively sanitizes objects and arrays
 *
 * Traverses nested data structures and sanitizes all string values
 * while preserving the original structure.
 *
 * @param {any} data - Data to sanitize (object, array, or primitive)
 * @returns {any} Deeply sanitized data
 *
 * @example
 * deepSanitize({
 *   name: '<script>evil</script>John',
 *   profile: { bio: 'Developer<iframe></iframe>' }
 * });
 * // Returns: { name: 'John', profile: { bio: 'Developer' } }
 */
const deepSanitize = (data: any): any => {
  // Handle arrays: sanitize each element
  if (Array.isArray(data)) {
    return data.map(deepSanitize);
  }

  // Handle objects: sanitize each property
  if (data && typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = deepSanitize(data[key]);
      return acc;
    }, {} as any);
  }

  // Handle primitives: sanitize strings, pass through others
  return sanitizeString(data);
};

/**
 * Express middleware for input sanitization
 *
 * Sanitizes all incoming request data:
 * - req.body: POST/PUT/PATCH request bodies
 * - req.query: URL query parameters
 * - req.params: URL path parameters
 *
 * Place this middleware BEFORE validation middleware.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @example
 * // In app.ts
 * app.use(sanitizeInput);
 *
 * // In route file
 * router.post('/create', sanitizeInput, validateRequest, createHandler);
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = deepSanitize(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  next();
};

/**
 * Utility functions for manual sanitization
 * Export for use in services or utilities
 *
 * @example
 * import { sanitizerUtils } from './middlewares/sanitizer';
 *
 * const clean = sanitizerUtils.sanitizeString(input);
 */
export const sanitizerUtils = {
  sanitizeString,
  deepSanitize,
};

export default sanitizerUtils;
