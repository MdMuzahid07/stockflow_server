/* eslint-disable no-console */
/**
 * Safe JSON Parser Middleware
 *
 * This middleware safely parses JSON data from FormData requests.
 * It prevents common security issues like DoS attacks via large JSON payloads
 * and provides meaningful error messages for malformed JSON.
 *
 * When using FormData with file uploads (multer), JSON data is typically
 * stringified in a "data" field. This middleware extracts and parses it.
 *
 * @module middlewares/safeJsonParser
 */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

/**
 * Maximum allowed JSON string size (10KB)
 * Prevents DoS attacks via large JSON payloads
 * @constant {number}
 */
const MAX_JSON_SIZE = 10000; // 10KB

/**
 * Safely parses JSON data from FormData requests
 *
 * When using FormData with file uploads, JSON data is often stringified
 * and sent as a "data" field. This middleware:
 * 1. Validates the JSON string is within size limits (10KB)
 * 2. Safely parses the JSON with error handling
 * 3. Validates the parsed result is an object (not array/primitive)
 * 4. Merges it with the existing request body (preserves multer fields)
 * 5. Removes the original "data" field to avoid duplication
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 *
 * @returns {void | Response} Continues to next middleware or returns error response
 *
 * @example
 * // Manual usage:
 * const formData = new FormData();
 * formData.append('data', JSON.stringify({ name: "Resume", folderId: "123" }));
 *
 * // Middleware will parse 'data' and set req.body:
 * req.body = { name: "Resume", folderId: "123" }
 * req.file = { ... } // Multer file object
 *
 * @example
 * // Usage in routes:
 * router.post('/create',
 *   multerUpload.single('image'),  // 1. Handle file upload
 *   safeJsonParser,                // 2. Parse JSON data
 *   validateRequest,               // 3. Validate schema
 *   controller                     // 4. Process request
 * );
 */
const safeJsonParser = (req: Request, res: Response, next: NextFunction): void | Response => {
  /**
   * Only process if "data" field exists and is a string
   * Skip processing for non-FormData requests
   */
  if (!req.body.data || typeof req.body.data !== "string") {
    return next();
  }

  try {
    const jsonData = req.body.data;

    /**
     * Security Check: Prevent DoS attacks via large JSON payloads
     */
    if (jsonData.length > MAX_JSON_SIZE) {
      console.warn(
        `[safeJsonParser] JSON data too large: ${jsonData.length} bytes (max: ${MAX_JSON_SIZE})`
      );
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "JSON data too large",
        error: `Maximum ${MAX_JSON_SIZE / 1024}KB allowed`,
        code: "JSON_SIZE_LIMIT_EXCEEDED",
      });
    }

    /**
     * Parse JSON with error handling
     * JSON.parse throws SyntaxError for malformed JSON
     */
    const parsed = JSON.parse(jsonData);

    /**
     * Type Validation: Ensure parsed data is an object
     * Reject arrays and primitives for consistent data structure
     */
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      console.warn(`[safeJsonParser] Invalid JSON format: ${typeof parsed}`);
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid JSON data format",
        error: "Expected an object",
        code: "INVALID_JSON_FORMAT",
      });
    }

    /**
     * Merge parsed data with existing request body
     * This preserves fields added by multer (file metadata)
     */
    req.body = { ...req.body, ...parsed };

    /**
     * Remove the original "data" field
     * Prevents duplication and confusion in downstream middleware
     */
    delete req.body.data;

    if (process.env.NODE_ENV === "development") {
      console.log(`[safeJsonParser] JSON parsed successfully: ${Object.keys(parsed).join(", ")}`);
    }
  } catch (error) {
    /**
     * Handle JSON parsing errors
     * Catches SyntaxError and other parsing issues
     */
    console.error("[safeJsonParser] JSON parsing error:", error);

    let errorMessage = "Unknown error";
    if (error instanceof SyntaxError) {
      errorMessage = "Invalid JSON syntax";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid JSON data",
      error: errorMessage,
      code: "JSON_PARSE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Continue to next middleware
   */
  next();
};

export default safeJsonParser;
