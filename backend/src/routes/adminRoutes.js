const express = require("express");
const router = Router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getDashboardMetrics } = require("../controllers/adminController");

// Require auth and admin roles for all dashboard paths
router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboardMetrics);

module.exports = router;
