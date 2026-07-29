const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { getCache, setCache, deleteCache } = require("../config/redis");
const { successResponse } = require("../utils/apiResponse");
const { ValidationError, NotFoundError } = require("../utils/errors");
const mongoose = require("mongoose");

/**
 * Helper to fetch a populated wishlist.
 */
const getPopulatedWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate("products", "name brand category price compareAtPrice images slug isActive");
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
    await wishlist.save();
    wishlist = await Wishlist.findOne({ user: userId }).populate("products", "name brand category price compareAtPrice images slug isActive");
  }

  // Filter out any deactivated/deleted products
  let hasInactive = false;
  const activeProducts = wishlist.products.filter(prod => {
    if (!prod || !prod.isActive) {
      hasInactive = true;
      return false;
    }
    return true;
  });

  if (hasInactive) {
    wishlist.products = activeProducts;
    await wishlist.save();
  }

  return wishlist;
};

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = `wishlist:${userId}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return successResponse(res, 200, "Wishlist retrieved successfully (cached)", cachedData);
    }

    const wishlist = await getPopulatedWishlist(userId);
    await setCache(cacheKey, wishlist);

    return successResponse(res, 200, "Wishlist retrieved successfully", wishlist);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/add
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationError("Valid Product ID is required.");
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError("Active product not found.");
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (wishlist.products.includes(productId)) {
      throw new ValidationError("Product is already in your wishlist.");
    }

    wishlist.products.push(productId);
    await wishlist.save();

    await deleteCache(`wishlist:${userId}`);

    const populated = await getPopulatedWishlist(userId);
    return successResponse(res, 200, "Product added to wishlist", populated);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/remove
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationError("Valid Product ID is required.");
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      throw new NotFoundError("Wishlist not found.");
    }

    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      throw new NotFoundError("Product not found in wishlist.");
    }

    await wishlist.save();
    await deleteCache(`wishlist:${userId}`);

    const populated = await getPopulatedWishlist(userId);
    return successResponse(res, 200, "Product removed from wishlist", populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
