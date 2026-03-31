import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import requestValidator from "../../middlewares/requestValidator";
import { ProductController } from "./product.controller";
import { createProductValidation, updateProductValidation } from "./product.validation";

const router = express.Router();

/**
 * Product Routes
 * Only Admin and Manager roles can access these routes
 */

// Get low stock products (Dashboard feature)
router.get(
  "/low-stock",
  authorizationGuard("admin", "manager"),
  ProductController.getLowStockProducts
);

router.post(
  "/",
  authorizationGuard("admin", "manager"),
  requestValidator(createProductValidation),
  ProductController.createProduct
);

router.get("/", authorizationGuard("admin", "manager"), ProductController.getAllProducts);

router.get("/:id", authorizationGuard("admin", "manager"), ProductController.getProductById);

router.patch(
  "/:id",
  authorizationGuard("admin", "manager"),
  requestValidator(updateProductValidation),
  ProductController.updateProduct
);

router.delete("/:id", authorizationGuard("admin", "manager"), ProductController.deleteProduct);

export const ProductRoutes = router;
