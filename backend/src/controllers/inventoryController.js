const Variant = require("../models/Variant");
const InventoryHistory = require("../models/InventoryHistory");
const { successResponse } = require("../utils/apiResponse");
const { ValidationError, NotFoundError } = require("../utils/errors");
const mongoose = require("mongoose");

// GET /api/inventory
const getInventoryStockLevels = async (req, res, next) => {
  try {
    const variants = await Variant.find({ isActive: true }).populate("productId", "name brand category");
    const stockLevels = variants.map(variant => {
      const isOutOfStock = variant.stockQuantity === 0;
      const isLowStock = !isOutOfStock && variant.stockQuantity <= variant.lowStockThreshold;
      return {
        variantId: variant._id,
        sku: variant.sku,
        product: variant.productId,
        size: variant.size,
        color: variant.color,
        stockQuantity: variant.stockQuantity,
        lowStockThreshold: variant.lowStockThreshold,
        status: isOutOfStock ? "Out of Stock" : (isLowStock ? "Low Stock" : "Healthy")
      };
    });
    return successResponse(res, 200, "Inventory stock levels retrieved successfully", stockLevels);
  } catch (error) {
    next(error);
  }
};

// GET /api/inventory/history/:variantId
const getInventoryHistory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new ValidationError("Invalid variant ID format.");
    }

    const history = await InventoryHistory.find({ variantId })
      .sort({ timestamp: -1 })
      .populate("performedBy", "name email");

    return successResponse(res, 200, "Inventory movement history retrieved successfully", history);
  } catch (error) {
    next(error);
  }
};

// POST /api/inventory/adjust
const adjustStock = async (req, res, next) => {
  try {
    const { variantId, quantityChanged, type, reason } = req.body;
    const details = [];

    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
      details.push({ field: "variantId", message: "A valid variant ID is required." });
    }
    if (quantityChanged === undefined || quantityChanged === null || isNaN(quantityChanged) || !Number.isInteger(quantityChanged) || quantityChanged === 0) {
      details.push({ field: "quantityChanged", message: "Quantity changed must be a non-zero integer." });
    }
    if (!type || !["increase", "decrease", "restock", "adjustment"].includes(type)) {
      details.push({ field: "type", message: "A valid adjustment type is required." });
    }

    if (details.length > 0) {
      throw new ValidationError("Stock adjustment validation failed.", details);
    }

    const variant = await Variant.findOne({ _id: variantId, isActive: true });
    if (!variant) {
      throw new NotFoundError("Active variant not found.");
    }

    const newQuantity = variant.stockQuantity + quantityChanged;
    if (newQuantity < 0) {
      throw new ValidationError("Insufficient inventory to complete the requested reduction.", [
        { field: "quantityChanged", message: `Current stock is ${variant.stockQuantity}, cannot decrease by ${Math.abs(quantityChanged)}` }
      ]);
    }

    variant.stockQuantity = newQuantity;
    await variant.save();

    // Log movement history record
    const history = new InventoryHistory({
      variantId: variant._id,
      productId: variant.productId,
      quantityChanged,
      type,
      performedBy: req.user ? req.user._id : null,
      reason: reason || `Manual adjustment type: ${type}`
    });
    await history.save();

    // Invalidate dashboard caches to refresh out of stock lists
    const { deleteCache } = require("../config/redis");
    await deleteCache("admin:dashboard");

    return successResponse(res, 200, "Stock adjusted successfully", {
      variantId: variant._id,
      sku: variant.sku,
      previousQuantity: variant.stockQuantity - quantityChanged,
      newQuantity: variant.stockQuantity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryStockLevels,
  getInventoryHistory,
  adjustStock
};
