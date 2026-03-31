/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Cloudinary Configuration Module
 *
 * This module configures and exports the Cloudinary instance for file storage and manipulation.
 * Cloudinary is a cloud-based image and video management service that provides storage,
 * transformation, optimization, and delivery capabilities.
 *
 * @module cloudinary.config
 */

import { v2 as cloudinary } from "cloudinary";

import config from "."; // Application configuration

/**
 * Configure Cloudinary with environment variables
 *
 * This configuration initializes the Cloudinary SDK with credentials from environment variables.
 * The secure: true option ensures all URLs use HTTPS for security.
 *
 * @see https://cloudinary.com/documentation/node_integration
 *
 * @example
 * // Environment variables required:
 * // CLOUDINARY_CLOUD_NAME=your_cloud_name
 * // CLOUDINARY_API_KEY=your_api_key
 * // CLOUDINARY_API_SECRET=your_api_secret
 */
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
  secure: true, // Enforce HTTPS for all URLs
});

/**
 * Exports the configured Cloudinary instance
 *
 * This instance provides access to all Cloudinary APIs including:
 * - uploader: For uploading files
 * - api: For administrative operations
 * - search: For finding files
 *
 * @type {Cloudinary}
 * @exports cloudinaryUpload
 */
const cloudinaryUpload = cloudinary;

/**
 * Helper function to upload files to Cloudinary with optimization
 *
 * This function provides a standardized way to upload files to Cloudinary
 * with automatic optimization and folder organization.
 *
 * @async
 * @param {Express.Multer.File} file - The file object from multer
 * @param {Object} options - Upload options
 * @param {string} [options.folder="orbit-file-explorer"] - Cloudinary folder path
 * @param {Array} [options.transformation=[]] - Additional transformations
 * @param {string} [options.resourceType="image"] - Resource type (image/video/raw)
 *
 * @returns {Promise<Object>} Cloudinary upload result
 *
 * @example
 * const result = await uploadToCloudinary(req.file, {
 *   folder: "orbit-drive/files",
 *   transformation: [{ width: 800, height: 600 }]
 * });
 *
 * @throws {Error} If upload fails
 */
const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: {
    folder?: string;
    transformation?: any[];
    resourceType?: "image" | "video" | "raw" | "auto";
  } = {}
): Promise<any> => {
  const { folder = "orbit-drive", transformation = [], resourceType = "auto" } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: [
          {
            quality: "auto", // Automatic quality optimization
            fetch_format: "auto", // Auto-select best format (webp for modern browsers)
          },
          ...transformation, // Additional custom transformations
        ],
        // allowed_formats: removed to allow all file types (validated by multer)
        max_file_size: 20 * 1024 * 1024, // 20MB file size limit to match Multer config
      },
      (error, result) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error("Cloudinary upload error:", error);
          reject(new Error(`Upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );

    // Upload file buffer (Multer Cloudinary storage already handles this)
    uploadStream.end(file.buffer);
  });
};

const cloudinaryConfig = {
  // uploadToCloudinary for => when not using multer storage cloudinary
  uploadToCloudinary,
  cloudinaryUpload,
};

export default cloudinaryConfig;
