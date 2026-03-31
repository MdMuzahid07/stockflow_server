import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import requestValidator from "../../middlewares/requestValidator";
import { CategoryController } from "./category.controller";
import { createCategoryValidation, updateCategoryValidation } from "./category.validation";

const router = express.Router();

/**
 * Category Routes
 * Only Admin and Manager roles can access these routes
 */
router.post(
  "/",
  authorizationGuard("admin", "manager"),
  requestValidator(createCategoryValidation),
  CategoryController.createCategory
);

router.get("/", authorizationGuard("admin", "manager"), CategoryController.getAllCategories);

router.get("/:id", authorizationGuard("admin", "manager"), CategoryController.getCategoryById);

router.patch(
  "/:id",
  authorizationGuard("admin", "manager"),
  requestValidator(updateCategoryValidation),
  CategoryController.updateCategory
);

router.delete("/:id", authorizationGuard("admin", "manager"), CategoryController.deleteCategory);

export const CategoryRoutes = router;
