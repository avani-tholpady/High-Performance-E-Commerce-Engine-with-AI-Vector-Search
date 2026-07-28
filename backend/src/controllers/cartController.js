const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const { getCache, setCache, deleteCache } = require("../config/redis");
const { successResponse } = require("../utils/apiResponse");
const { ValidationError, NotFoundError } = require("../utils/errors");
const mongoose = require("mongoose");

/**
 * Helper to fetch a fully populated cart.
 */
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate("items.product", "name brand category images slug isActive")
    .populate("items.variant", "sku size color stockQuantity price salePrice isActive");

  if (!cart) {
    cart = new Cart({ user: userId, items: [], grandTotal: 0 });
    await cart.save();
    cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name brand category images slug isActive")
      .populate("items.variant", "sku size color stockQuantity price salePrice isActive");
  }

  // Filter out inactive products/variants if any got deactivated
  let hasInactive = false;
  const activeItems = cart.items.filter(item => {
    if (!item.product || !item.product.isActive || !item.variant || !item.variant.isActive) {
      hasInactive = true;
      return false;
    }
    return true;
  });

  if (hasInactive) {
    cart.items = activeItems;
    await cart.save();
  }

  return cart;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = `cart:${userId}`;

    const cachedCart = await getCache(cacheKey);
    if (cachedCart) {
      return successResponse(res, 200, "Cart retrieved successfully (cached)", cachedCart);
    }

    const cart = await getPopulatedCart(userId);
    await setCache(cacheKey, cart);

    return successResponse(res, 200, "Cart retrieved successfully", cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { productId, variantId, quantity } = req.body;
    const qty = Number(quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationError("Valid Product ID is required.", [{ field: "productId", message: "Invalid ID" }]);
    }
    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
      throw new ValidationError("Valid Variant ID is required.", [{ field: "variantId", message: "Invalid ID" }]);
    }
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      throw new ValidationError("Quantity must be a positive integer.", [{ field: "quantity", message: "Must be >= 1" }]);
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError("Active product not found.");
    }

    // Verify variant exists, belongs to product, and is active
    const variant = await Variant.findOne({ _id: variantId, productId, isActive: true });
    if (!variant) {
      throw new NotFoundError("Active variant not found for this product.");
    }

    // Validate inventory stock
    if (variant.stockQuantity < qty) {
      throw new ValidationError("Insufficient stock available.", [
        { field: "quantity", message: `Requested ${qty} but only ${variant.stockQuantity} in stock.` }
      ]);
    }

    // Get current cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemPrice = variant.salePrice !== undefined && variant.salePrice !== null ? variant.salePrice : variant.price;

    // Check duplicate item
    const existingIndex = cart.items.findIndex(
      item => item.variant.toString() === variantId
    );

    if (existingIndex > -1) {
      // Validate inventory for total quantity
      const newQty = cart.items[existingIndex].quantity + qty;
      if (variant.stockQuantity < newQty) {
        throw new ValidationError("Insufficient stock available for updated cart quantity.", [
          { field: "quantity", message: `Total items in cart would be ${newQty} but only ${variant.stockQuantity} in stock.` }
        ]);
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice; // update with latest price
      cart.items[existingIndex].subtotal = newQty * itemPrice;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity: qty,
        price: itemPrice,
        subtotal: qty * itemPrice
      });
    }

    await cart.save();

    // Clear Redis Cache
    await deleteCache(`cart:${userId}`);

    const populatedCart = await getPopulatedCart(userId);
    return successResponse(res, 200, "Item added to cart", populatedCart);
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { variantId, quantity } = req.body;
    const qty = Number(quantity);

    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
      throw new ValidationError("Valid Variant ID is required.");
    }
    if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      throw new ValidationError("Quantity must be a positive integer.");
    }

    const variant = await Variant.findOne({ _id: variantId, isActive: true });
    if (!variant) {
      throw new NotFoundError("Active variant not found.");
    }

    if (variant.stockQuantity < qty) {
      throw new ValidationError("Insufficient stock available.", [
        { field: "quantity", message: `Requested ${qty} but only ${variant.stockQuantity} in stock.` }
      ]);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundError("Cart not found.");
    }

    const itemIndex = cart.items.findIndex(
      item => item.variant.toString() === variantId
    );

    if (itemIndex === -1) {
      throw new NotFoundError("Item not found in cart.");
    }

    const itemPrice = variant.salePrice !== undefined && variant.salePrice !== null ? variant.salePrice : variant.price;

    cart.items[itemIndex].quantity = qty;
    cart.items[itemIndex].price = itemPrice;
    cart.items[itemIndex].subtotal = qty * itemPrice;

    await cart.save();
    await deleteCache(`cart:${userId}`);

    const populatedCart = await getPopulatedCart(userId);
    return successResponse(res, 200, "Cart item updated successfully", populatedCart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/remove
const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { variantId } = req.body;

    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
      throw new ValidationError("Valid Variant ID is required.");
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundError("Cart not found.");
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.variant.toString() !== variantId
    );

    if (cart.items.length === initialLength) {
      throw new NotFoundError("Item not found in cart.");
    }

    await cart.save();
    await deleteCache(`cart:${userId}`);

    const populatedCart = await getPopulatedCart(userId);
    return successResponse(res, 200, "Item removed from cart", populatedCart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.grandTotal = 0;
      await cart.save();
    }

    await deleteCache(`cart:${userId}`);
    return successResponse(res, 200, "Cart cleared successfully", { items: [], grandTotal: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
