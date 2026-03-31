import express from "express";

import multerUploadConfig from "../../config/multer.config";
import authorizationGuard from "../../middlewares/authorizationGuard";
import { UploadController } from "./upload.controller";

const router = express.Router();

/**
 * Upload Routes
 * Used to upload images (products, etc.) to Cloudinary
 * Restricted to Admin and Manager roles
 */

router.post(
  "/single",
  authorizationGuard("admin", "manager"),
  multerUploadConfig.multerUpload.single("file"),
  UploadController.uploadSingleFile
);

router.post(
  "/multiple",
  authorizationGuard("admin", "manager"),
  multerUploadConfig.multerUploadMultiple.array("files", 10),
  UploadController.uploadMultipleFiles
);

export const UploadRoutes = router;
