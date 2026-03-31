import { Request, Response } from "express";
import httpStatus from "http-status";

import cloudinaryConfig from "../../config/cloudinary.config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/send.response";
import CustomAppError from "../../errors/CustomAppError";

/**
 * Controller for uploading a single file
 */
const uploadSingleFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Please provide a file to upload");
  }

  // Use the buffer to upload to Cloudinary
  const result = await cloudinaryConfig.uploadToCloudinary(req.file, {
    folder: "stockflow/products",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

/**
 * Controller for uploading multiple files
 */
const uploadMultipleFiles = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new CustomAppError(httpStatus.BAD_REQUEST, "Please provide files to upload");
  }

  // Upload all files in parallel
  const uploadPromises = files.map((file) =>
    cloudinaryConfig.uploadToCloudinary(file, {
      folder: "stockflow/products",
    })
  );

  const results = await Promise.all(uploadPromises);

  const data = results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${files.length} files uploaded successfully`,
    data,
  });
});

export const UploadController = {
  uploadSingleFile,
  uploadMultipleFiles,
};
