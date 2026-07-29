const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPaymentIntent,
  verifyPayment,
  handleWebhook
} = require("../controllers/paymentController");

// Protected checkout endpoints
router.post("/intent", protect, createPaymentIntent);
router.post("/verify", protect, verifyPayment);

// Public webhook callback endpoint
router.post("/webhook", handleWebhook);

module.exports = router;
