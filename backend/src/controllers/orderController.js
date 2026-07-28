const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  ValidationError,
  NotFoundError,
  InvalidIdError,
  UnauthorizedError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");

/**
 * Validates request payload for order creation.
 * @param {Object} body Request body
 * @returns {Array} List of validation error objects
 */
const validateOrderPayload = (body) => {
  const details = [];

  // Check items array
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    details.push({
      field: "items",
      message: "Order items must be a non-empty array."
    });
  } else {
    body.items.forEach((item, index) => {
      if (!item.product || typeof item.product !== "string" || !mongoose.Types.ObjectId.isValid(item.product)) {
        details.push({
          field: `items[${index}].product`,
          message: "Each item must contain a valid product ObjectId."
        });
      }
      const qty = Number(item.quantity);
      if (item.quantity === undefined || item.quantity === null || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
        details.push({
          field: `items[${index}].quantity`,
          message: "Item quantity must be an integer greater than or equal to 1."
        });
      }
    });
  }

  // Validate totalAmount if provided
  if (body.totalAmount !== undefined && body.totalAmount !== null) {
    const total = Number(body.totalAmount);
    if (isNaN(total) || total < 0) {
      details.push({
        field: "totalAmount",
        message: "Total amount must be a positive number greater than or equal to 0.00."
      });
    }
  }

  // Validate status if provided
  if (body.status !== undefined && body.status !== null) {
    const allowedStatuses = ["Pending", "Paid", "Shipped"];
    if (!allowedStatuses.includes(body.status)) {
      details.push({
        field: "status",
        message: "Status must be one of: Pending, Paid, Shipped."
      });
    }
  }

  return details;
};

// POST /api/orders (Protected)
const createOrder = async (req, res, next) => {
  try {
    // 1. Verify user is authenticated
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError("User is not authenticated.");
    }

    // 2. Validate payload
    const validationErrors = validateOrderPayload(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError("The order payload submitted contains validation errors.", validationErrors);
    }

    // 3. Extract product IDs and query DB
    const productIds = req.body.items.map((item) => item.product);
    const existingProducts = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    const productMap = {};
    existingProducts.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // Check if any product was not found or inactive
    for (const item of req.body.items) {
      if (!productMap[item.product]) {
        throw new NotFoundError(`Product with ID '${item.product}' was not found or is currently inactive.`);
      }
    }

    // 4. Calculate total amount if not explicitly supplied
    let calculatedTotal = 0;
    req.body.items.forEach((item) => {
      const prod = productMap[item.product];
      calculatedTotal += prod.price * item.quantity;
    });
    calculatedTotal = parseFloat(calculatedTotal.toFixed(2));

    const finalTotalAmount = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : calculatedTotal;

    // 5. Create Order document strictly associating authenticated user ID (ignores req.body.user)
    const orderData = {
      user: req.user._id,
      items: req.body.items,
      totalAmount: finalTotalAmount,
      status: req.body.status || "Pending"
    };

    const order = new Order(orderData);
    await order.save();
    await order.populate("items.product");

    return successResponse(res, 201, "Order created successfully", order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders (Protected - returns ONLY orders of logged in user)
const getOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError("User is not authenticated.");
    }

    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Orders retrieved successfully", orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders
};
