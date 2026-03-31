import express from "express";

import authorizationGuard from "../../middlewares/authorizationGuard";
import { ActivityLogController } from "./activityLog.controller";

const router = express.Router();

/**
 * Activity Log Routes
 * Admin and Manager only
 */

router.get("/", authorizationGuard("admin", "manager"), ActivityLogController.getRecentLogs);

export const ActivityLogRoutes = router;
