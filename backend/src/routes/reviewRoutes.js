const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews
} = require("../controllers/reviewController");

// Public endpoints
router.get("/product/:productId", getProductReviews);

// Protected mutation endpoints
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
