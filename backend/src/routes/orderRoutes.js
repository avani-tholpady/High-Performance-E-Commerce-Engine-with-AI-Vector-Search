const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getOrders,
  cancelOrder,
  getOrderDetails,
  adminGetAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Require JWT authentication for all order paths
router.use(protect);

// Customer endpoints
router.post("/", createOrder);
router.post("/:id/cancel", cancelOrder);
router.get("/", getOrders);
router.get("/my-orders", getOrders);
router.get("/:id", getOrderDetails);

// Administrative endpoints
router.get("/admin/all", authorize("admin"), adminGetAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
