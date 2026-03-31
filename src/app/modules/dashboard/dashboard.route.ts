import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

/**
 * Dashboard Routes
 * Provides real-time stats and analytics for business monitoring.
 * Restricted to Admin and Manager roles.
 */

router.get("/stats", authorizationGuard("admin", "manager"), DashboardController.getStats);

router.get(
  "/analytics",
  authorizationGuard("admin", "manager"),
  DashboardController.getAnalyticsData
);

export const DashboardRoutes = router;
