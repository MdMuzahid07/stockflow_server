import express, { Router } from "express";

import { ActivityLogRoutes } from "../modules/activityLog/activityLog.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";
import { OrderRoutes } from "../modules/order/order.route";
import { ProductRoutes } from "../modules/product/product.route";
import { RestockRoutes } from "../modules/restock/restock.route";
import { UploadRoutes } from "../modules/upload/upload.route";

const router = express.Router();

const moduleRoutes: { path: string; route: Router }[] = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/uploads",
    route: UploadRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/activity-logs",
    route: ActivityLogRoutes,
  },
  {
    path: "/restock",
    route: RestockRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
