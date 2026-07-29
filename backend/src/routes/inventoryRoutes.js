const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getInventoryStockLevels,
  getInventoryHistory,
  adjustStock
} = require("../controllers/inventoryController");

// Require auth and admin roles for all inventory ledgers
router.use(protect);
router.use(authorize("admin"));

router.get("/", getInventoryStockLevels);
router.get("/history/:variantId", getInventoryHistory);
router.post("/adjust", adjustStock);

module.exports = router;
