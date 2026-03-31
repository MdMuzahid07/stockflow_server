import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import { RestockController } from "./restock.controller";

const router = express.Router();

/**
 * Restock Routes
 * Admin and Manager only
 */

router.get("/", authorizationGuard("admin", "manager"), RestockController.getPendingQueue);

router.post(
  "/execute/:id",
  authorizationGuard("admin", "manager"),
  RestockController.executeRestock
);

export const RestockRoutes = router;
