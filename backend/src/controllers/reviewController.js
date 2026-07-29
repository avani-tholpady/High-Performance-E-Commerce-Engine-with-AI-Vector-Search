const Review = require("../models/Review");
const Product = require("../models/Product");
const { successResponse } = require("../utils/apiResponse");
const { ValidationError, NotFoundError, UnauthorizedError } = require("../utils/errors");
const mongoose = require("mongoose");

/**
 * Recalculates product rating statistics (average and count) and updates the Product record.
 */
const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const average = stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(2)) : 0;
  const count = stats.length > 0 ? stats[0].reviewCount : 0;

  await Product.findByIdAndUpdate(productId, {
    "ratings.average": average,
    "ratings.count": count
  });

  // Evict Product Caches
  const { deleteCache } = require("../config/redis");
  await deleteCache(`products:id:${productId}`);
  await deleteCache("products:list:*");
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const details = [];

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      details.push({ field: "productId", message: "Valid Product ID is required." });
    }
    const numRating = Number(rating);
    if (rating === undefined || rating === null || isNaN(numRating) || numRating < 1 || numRating > 5) {
      details.push({ field: "rating", message: "Rating must be a number between 1 and 5." });
    }

    if (details.length > 0) {
      throw new ValidationError("Review validation failed.", details);
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError("Active product not found.");
    }

    // Check duplicate review
    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      throw new ValidationError("You have already reviewed this product. Please update your existing review instead.");
    }

    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: numRating,
      comment: comment ? comment.trim() : ""
    });

    await review.save();
    await updateProductRatingStats(productId);

    return successResponse(res, 201, "Review posted successfully", review);
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid review ID format.");
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new UnauthorizedError("You are not authorized to update this review.");
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        throw new ValidationError("Rating must be a number between 1 and 5.");
      }
      review.rating = numRating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await updateProductRatingStats(review.product);

    return successResponse(res, 200, "Review updated successfully", review);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid review ID format.");
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new UnauthorizedError("You are not authorized to delete this review.");
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);
    await updateProductRatingStats(productId);

    return successResponse(res, 200, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/product/:productId
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationError("Invalid product ID format.");
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Product reviews retrieved successfully", reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews
};
