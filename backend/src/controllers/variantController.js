const mongoose = require("mongoose");
const Variant = require("../models/Variant");
const Product = require("../models/Product");
const {
  ValidationError,
  NotFoundError,
  DuplicateError,
  InvalidIdError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");

/**
 * Computes inventory alert status and messages.
 */
const getInventoryAlerts = (variant) => {
  const isOutOfStock = variant.stockQuantity === 0;
  const isLowStock = !isOutOfStock && variant.stockQuantity <= variant.lowStockThreshold;

  let alertMessage = "Stock level is healthy.";
  if (isOutOfStock) {
    alertMessage = `Out of stock alert: SKU-${variant.sku} is out of stock.`;
  } else if (isLowStock) {
    alertMessage = `Low stock alert: Only ${variant.stockQuantity} units remaining for SKU-${variant.sku}.`;
  }

  return {
    isLowStock,
    isOutOfStock,
    alertMessage
  };
};

/**
 * Formats a variant database document to include dynamic inventory alert parameters.
 */
const formatVariantResponse = (variant) => {
  if (!variant) return null;
  const alerts = getInventoryAlerts(variant);
  const variantObj = variant.toObject ? variant.toObject() : variant;
  return {
    ...variantObj,
    inventoryAlerts: alerts
  };
};

/**
 * Validate variant parameters.
 */
const validateVariantPayload = (body, isUpdate = false) => {
  const details = [];

  if (!isUpdate) {
    if (!body.productId || !mongoose.Types.ObjectId.isValid(body.productId)) {
      details.push({ field: "productId", message: "A valid product ID reference is required." });
    }
    if (!body.sku || typeof body.sku !== "string" || body.sku.trim() === "") {
      details.push({ field: "sku", message: "SKU is required." });
    }
    if (body.price === undefined || body.price === null) {
      details.push({ field: "price", message: "Regular price is required." });
    }
    if (body.stockQuantity === undefined || body.stockQuantity === null) {
      details.push({ field: "stockQuantity", message: "Stock quantity is required." });
    }
  }

  if (body.sku && (body.sku.length < 3 || body.sku.length > 30)) {
    details.push({ field: "sku", message: "SKU must be between 3 and 30 characters." });
  }

  if (body.sku && !/^[a-zA-Z0-9-]+$/.test(body.sku)) {
    details.push({ field: "sku", message: "SKU must contain only alphanumeric characters and hyphens." });
  }

  if (body.price !== undefined && body.price !== null) {
    const p = Number(body.price);
    if (isNaN(p) || p < 0) {
      details.push({ field: "price", message: "Price must be a positive number greater than or equal to 0.00." });
    }
  }

  if (body.salePrice !== undefined && body.salePrice !== null) {
    const sp = Number(body.salePrice);
    if (isNaN(sp) || sp < 0) {
      details.push({ field: "salePrice", message: "Sale price must be a positive number greater than or equal to 0.00." });
    }
  }

  if (body.stockQuantity !== undefined && body.stockQuantity !== null) {
    const sq = Number(body.stockQuantity);
    if (isNaN(sq) || sq < 0 || !Number.isInteger(sq)) {
      details.push({ field: "stockQuantity", message: "Stock quantity must be a non-negative integer." });
    }
  }

  if (body.lowStockThreshold !== undefined && body.lowStockThreshold !== null) {
    const lst = Number(body.lowStockThreshold);
    if (isNaN(lst) || lst < 0 || !Number.isInteger(lst)) {
      details.push({ field: "lowStockThreshold", message: "Low stock threshold must be a non-negative integer." });
    }
  }

  if (body.images && !Array.isArray(body.images)) {
    details.push({ field: "images", message: "Images must be an array of URLs." });
  }

  return details;
};

// POST /api/variants
const createVariant = async (req, res, next) => {
  try {
    const validationErrors = validateVariantPayload(req.body, false);
    if (validationErrors.length > 0) {
      throw new ValidationError("Variant payload validation failed.", validationErrors);
    }

    const { productId, sku, price, salePrice } = req.body;

    // Check parent product exists
    const parentProduct = await Product.findOne({ _id: productId, isActive: true });
    if (!parentProduct) {
      throw new NotFoundError(`Parent product with ID '${productId}' not found or is inactive.`);
    }

    // Check duplicate SKU
    const cleanSku = sku.trim().toUpperCase();
    const existingSku = await Variant.findOne({ sku: cleanSku });
    if (existingSku) {
      throw new DuplicateError(`Variant SKU '${cleanSku}' already exists.`);
    }

    // Validate salePrice vs price
    const finalPrice = Number(price);
    const finalSalePrice = salePrice !== undefined && salePrice !== null ? Number(salePrice) : null;
    if (finalSalePrice !== null && finalSalePrice >= finalPrice) {
      throw new ValidationError("Validation failed.", [
        { field: "salePrice", message: "Sale price must be strictly less than regular price." }
      ]);
    }

    const variant = new Variant({
      ...req.body,
      sku: cleanSku
    });

    await variant.save();
    return successResponse(res, 201, "Variant created successfully", formatVariantResponse(variant));
  } catch (error) {
    next(error);
  }
};

// PUT /api/variants/:id
const updateVariant = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError("Invalid variant ID format.");
    }

    const variant = await Variant.findOne({ _id: req.params.id, isActive: true });
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${req.params.id}' was not found or is inactive.`);
    }

    const validationErrors = validateVariantPayload(req.body, true);
    if (validationErrors.length > 0) {
      throw new ValidationError("Variant update validation failed.", validationErrors);
    }

    // Check duplicate SKU if SKU is changing
    if (req.body.sku) {
      const cleanSku = req.body.sku.trim().toUpperCase();
      if (cleanSku !== variant.sku) {
        const existingSku = await Variant.findOne({ sku: cleanSku });
        if (existingSku) {
          throw new DuplicateError(`Variant SKU '${cleanSku}' already exists.`);
        }
      }
    }

    // Validate salePrice vs price
    const finalPrice = req.body.price !== undefined ? Number(req.body.price) : variant.price;
    const finalSalePrice = req.body.salePrice !== undefined ? (req.body.salePrice !== null ? Number(req.body.salePrice) : null) : variant.salePrice;
    if (finalSalePrice !== null && finalSalePrice >= finalPrice) {
      throw new ValidationError("Validation failed.", [
        { field: "salePrice", message: "Sale price must be strictly less than regular price." }
      ]);
    }

    const updatableFields = [
      "sku", "size", "color", "material", "images", "stockQuantity",
      "lowStockThreshold", "price", "salePrice", "barcode", "weight",
      "dimensions", "isActive"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "sku") {
          variant[field] = req.body[field].trim().toUpperCase();
        } else {
          variant[field] = req.body[field];
        }
      }
    });

    await variant.save();
    return successResponse(res, 200, "Variant updated successfully", formatVariantResponse(variant));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/variants/:id
const deleteVariant = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError("Invalid variant ID format.");
    }

    const variant = await Variant.findOne({ _id: req.params.id, isActive: true });
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${req.params.id}' was not found or is already inactive.`);
    }

    // Soft delete
    variant.isActive = false;
    await variant.save();

    return successResponse(res, 200, "Variant successfully deactivated", {
      id: variant._id,
      isActive: variant.isActive
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/variants/:id
const getVariantById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError("Invalid variant ID format.");
    }

    const variant = await Variant.findOne({ _id: req.params.id, isActive: true }).populate("productId");
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${req.params.id}' was not found or is inactive.`);
    }

    return successResponse(res, 200, "Variant retrieved successfully", formatVariantResponse(variant));
  } catch (error) {
    next(error);
  }
};

// GET /api/variants/product/:productId
const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new InvalidIdError("Invalid product ID format.");
    }

    const variants = await Variant.find({ productId, isActive: true });
    const formattedVariants = variants.map(formatVariantResponse);

    return successResponse(res, 200, "Variants retrieved successfully for product", formattedVariants);
  } catch (error) {
    next(error);
  }
};

// GET /api/variants
const getAllVariants = async (req, res, next) => {
  try {
    const variants = await Variant.find({ isActive: true });
    const formattedVariants = variants.map(formatVariantResponse);

    return successResponse(res, 200, "All active variants retrieved successfully", formattedVariants);
  } catch (error) {
    next(error);
  }
};

// GET /api/variants/search
const searchVariants = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const { sku, color, size, material, barcode } = req.query;

    if (sku) filter.sku = new RegExp(String(sku).trim(), "i");
    if (color) filter.color = new RegExp(String(color).trim(), "i");
    if (size) filter.size = new RegExp(String(size).trim(), "i");
    if (material) filter.material = new RegExp(String(material).trim(), "i");
    if (barcode) filter.barcode = String(barcode).trim();

    const variants = await Variant.find(filter).populate("productId");
    const formattedVariants = variants.map(formatVariantResponse);

    return successResponse(res, 200, "Variant search completed successfully", formattedVariants);
  } catch (error) {
    next(error);
  }
};

// POST /api/variants/:id/stock/increase
const increaseStock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError("Invalid variant ID format.");
    }

    const { quantity } = req.body;
    const qty = Number(quantity);
    if (quantity === undefined || quantity === null || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      throw new ValidationError("Stock quantity adjustment validation failed.", [
        { field: "quantity", message: "Quantity must be a positive integer." }
      ]);
    }

    const variant = await Variant.findOne({ _id: req.params.id, isActive: true });
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${req.params.id}' was not found or is inactive.`);
    }

    variant.stockQuantity += qty;
    await variant.save();

    return successResponse(res, 200, "Stock increased successfully", formatVariantResponse(variant));
  } catch (error) {
    next(error);
  }
};

// POST /api/variants/:id/stock/decrease
const decreaseStock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError("Invalid variant ID format.");
    }

    const { quantity } = req.body;
    const qty = Number(quantity);
    if (quantity === undefined || quantity === null || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      throw new ValidationError("Stock quantity adjustment validation failed.", [
        { field: "quantity", message: "Quantity must be a positive integer." }
      ]);
    }

    const variant = await Variant.findOne({ _id: req.params.id, isActive: true });
    if (!variant) {
      throw new NotFoundError(`Variant with ID '${req.params.id}' was not found or is inactive.`);
    }

    if (variant.stockQuantity < qty) {
      throw new ValidationError("Insufficient inventory. Operation would result in negative stock.", [
        {
          field: "quantity",
          message: `Cannot decrease stock by ${qty}. Current stock is only ${variant.stockQuantity}.`
        }
      ]);
    }

    variant.stockQuantity -= qty;
    await variant.save();

    return successResponse(res, 200, "Stock decreased successfully", formatVariantResponse(variant));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
  getVariantsByProduct,
  getAllVariants,
  searchVariants,
  increaseStock,
  decreaseStock
};
