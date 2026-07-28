const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Variant = require("../models/Variant");
const { getCache, setCache } = require("../config/redis");
const { successResponse } = require("../utils/apiResponse");

// GET /api/admin/dashboard
const getDashboardMetrics = async (req, res, next) => {
  try {
    const cacheKey = "admin:dashboard";

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return successResponse(res, 200, "Dashboard metrics retrieved successfully (cached)", cachedData);
    }

    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });

    // Revenue aggregation (Paid orders only)
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "Paid", status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);
    const revenue = revenueData.length > 0 ? parseFloat(revenueData[0].total.toFixed(2)) : 0;

    // Today's Sales (Since midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" }
        }
      },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);
    const todaySales = todaySalesData.length > 0 ? parseFloat(todaySalesData[0].total.toFixed(2)) : 0;

    // Monthly Sales (Past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: "Paid",
          status: { $ne: "Cancelled" }
        }
      },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);
    const monthlySales = monthlySalesData.length > 0 ? parseFloat(monthlySalesData[0].total.toFixed(2)) : 0;

    // Low stock items (active variants with stockQuantity <= lowStockThreshold)
    const lowStockVariants = await Variant.find({
      isActive: true,
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
    }).populate("productId", "name brand category");

    const lowStockProducts = lowStockVariants.map(v => ({
      variantId: v._id,
      sku: v.sku,
      productName: v.productId ? v.productId.name : "Unknown",
      stockQuantity: v.stockQuantity,
      lowStockThreshold: v.lowStockThreshold
    }));

    // Top selling products
    const topSelling = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenueGenerated: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenueGenerated: 1,
          name: "$productInfo.name",
          brand: "$productInfo.brand",
          category: "$productInfo.category"
        }
      }
    ]);

    // Latest Orders
    const latestOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const metrics = {
      summary: {
        totalProducts,
        totalOrders,
        totalUsers,
        revenue,
        todaySales,
        monthlySales
      },
      lowStockProducts,
      topSellingProducts: topSelling,
      latestOrders
    };

    // Cache results for 10 minutes (600 seconds)
    await setCache(cacheKey, metrics, 600);

    return successResponse(res, 200, "Dashboard metrics retrieved successfully", metrics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
