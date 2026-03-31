import ActivityLogModel from "../activityLog/activityLog.model";
import OrderModel from "../order/order.model";
import ProductModel from "../product/product.model";

/**
 * Retrieves key dashboard metrics and insights for the current day.
 * @returns {Promise<Object>} Dashboard statistics.
 */
const getStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Total Orders Today (Count)
  const totalOrdersToday = await OrderModel.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd },
    isDeleted: false,
  });

  // 2. Revenue Today (Sum of totalAmount for non-cancelled orders)
  const revenueResult = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: "cancelled" },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const revenueToday = revenueResult[0]?.totalRevenue || 0;

  // 3. Order Status Breakdown
  const statusBreakdown = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: todayStart, $lte: todayEnd },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Transform status breakdown into a more readable format
  const statusSummary = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  statusBreakdown.forEach((item) => {
    if (item._id in statusSummary) {
      statusSummary[item._id as keyof typeof statusSummary] = item.count;
    }
  });

  // 4. Low Stock Items Count
  const lowStockItemsCount = await ProductModel.countDocuments({
    isDeleted: false,
    $expr: { $lt: ["$stockQuantity", "$minThreshold"] },
  });

  // 5. Recent System Actions (Latest 5-10)
  const recentActivities = await ActivityLogModel.find()
    .populate("user", "name role")
    .sort({ createdAt: -1 })
    .limit(10);

  // 6. Product Summary (e.g., iPhone 13 — 3 left (Low Stock))
  const products = await ProductModel.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("name stockQuantity minThreshold");

  const productSummary = products.map((p) => ({
    name: p.name,
    stock: p.stockQuantity,
    status: p.stockQuantity < p.minThreshold ? "Low Stock" : "OK",
  }));

  return {
    revenueToday,
    totalOrdersToday,
    statusSummary,
    lowStockItemsCount,
    recentActivities,
    productSummary,
  };
};

/**
 * Retrieves analytics data (revenue and order count) for the last 7 days.
 * @returns {Promise<Array>} Analytics sparkline data.
 */
const getAnalyticsData = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const analytics = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: "cancelled" },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return analytics;
};

export const DashboardService = {
  getStats,
  getAnalyticsData,
};

export default DashboardService;
