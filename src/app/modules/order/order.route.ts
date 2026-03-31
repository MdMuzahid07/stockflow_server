import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import requestValidator from "../../middlewares/requestValidator";
import { OrderController } from "./order.controller";
import { createOrderValidation, updateOrderStatusValidation } from "./order.validation";

const router = express.Router();

/**
 * Order Routes
 * Only Admin and Manager roles can access these routes
 */

router.post(
  "/",
  authorizationGuard("admin", "manager"),
  requestValidator(createOrderValidation),
  OrderController.createOrder
);

router.get("/", authorizationGuard("admin", "manager"), OrderController.getAllOrders);

router.get("/:id", authorizationGuard("admin", "manager"), OrderController.getOrderById);

router.patch(
  "/:id/status",
  authorizationGuard("admin", "manager"),
  requestValidator(updateOrderStatusValidation),
  OrderController.updateOrderStatus
);

router.delete("/:id", authorizationGuard("admin", "manager"), OrderController.deleteOrder);

export const OrderRoutes = router;
