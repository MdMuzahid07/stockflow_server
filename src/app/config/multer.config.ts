/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Multer Configuration Module
 *
 * This module configures multer with Cloudinary storage for handling file uploads.
 * It includes file validation, size limits, and automatic Cloudinary integration.
 *
 * @module multer.config
 */

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinaryConfig from "./cloudinary.config";

/**
 * Allowed MIME types for file uploads
 * @constant {string[]}
 */
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",

  // Text & Code
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/xml",

  // Documents
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/rtf",

  // Audio
  "audio/mpeg", // MP3
  "audio/wav",
  "audio/ogg",
  "audio/mp4", // M4A
  "audio/webm",
  "audio/aac",

  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime", // MOV
  "video/x-msvideo", // AVI
  "video/x-matroska", // MKV

  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip",
  "application/x-tar",
];

/**
 * Maximum file size (15MB)
 * @constant {number}
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Sanitize filename to prevent directory traversal and special chars
 * @param {string} originalName
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (originalName: string): string => {
  return originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
};

/**
 * File validation middleware
 *
 * Validates uploaded files for MIME type before processing.
 * File size is validated by multer's limits configuration.
 *
 * @param {Object} req - Express request object
 * @param {Express.Multer.File} file - The uploaded file
 * @param {multer.FileFilterCallback} cb - Callback function
 *
 * @returns {void}
 *
 * @throws {Error} If file type is invalid
 */
const validateFile = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  // Validate file type check
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const errorMessage = `Invalid file type: ${file.mimetype}. File type not allowed for security reasons.`;
    console.warn(`File validation failed: ${errorMessage}`);
    return cb(new Error(errorMessage));
  }

  // Sanitize filename attached to the file object
  file.originalname = sanitizeFilename(file.originalname);

  // File type passes validation
  console.log(`File type validated: ${file.originalname} (${file.mimetype})`);
  cb(null, true);
};

/**
 * Cloudinary storage configuration
 *
 * Configures where and how files are stored in Cloudinary.
 * Includes automatic folder organization and image optimization.
 *
 * @type {CloudinaryStorage}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig.cloudinaryUpload,

  params: async (req: any, file: any) => {
    /**
     * Determine folder based on request route
     * Organizes files logically in Cloudinary by feature area
     */
    const getFolder = (): string => {
      const baseFolder = "orbit-drive";
      return baseFolder;
    };

    return {
      folder: getFolder(),
      resource_type: "auto", // Auto-detect image/video/raw
      public_id: `${Date.now()}-${sanitizeFilename(file.originalname).split(".")[0]}`,
    };
  },
});

// Override with memory storage to preserve file buffers for text content
const storage = multer.memoryStorage();

/**
 * Single file upload configuration
 *
 * Configured for single file uploads with validation and limits.
 * This is the primary upload middleware for most routes.
 *
 * @type {multer.Multer}
 * @exports multerUpload
 */
const multerUpload = multer({
  storage,
  fileFilter: validateFile,
  limits: {
    fileSize: MAX_FILE_SIZE, // 100MB file size limit
    files: 10,
  },
});

/**
 * Multiple file upload configuration
 *
 * Configured for multiple file uploads (up to 10 files).
 * Useful for galleries or bulk uploads.
 *
 * @type {multer.Multer}
 * @exports multerUploadMultiple
 */
const multerUploadMultiple = multer({
  storage,
  fileFilter: validateFile,
  limits: {
    fileSize: MAX_FILE_SIZE, // 100MB per file
    files: 20, // Maximum 20 files per request
  },
});
// .array("images", 10);

/**
 * Export multer configurations
 *
 * @exports multerUploadConfig
 */
const multerUploadConfig = { multerUpload, multerUploadMultiple };

export default multerUploadConfig;
