const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Cart = require("../models/Cart");
const InventoryHistory = require("../models/InventoryHistory");
const notificationService = require("../services/notificationService");
const { getCache, setCache, deleteCache } = require("../config/redis");
const {
  ValidationError,
  NotFoundError,
  InvalidIdError,
  UnauthorizedError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");

/**
 * Validates request payload for order creation.
 */
const validateOrderPayload = (body) => {
  const details = [];

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    details.push({ field: "items", message: "Order items must be a non-empty array." });
  } else {
    body.items.forEach((item, index) => {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        details.push({ field: `items[${index}].product`, message: "Valid Product ID reference is required." });
      }
      if (!item.variant || !mongoose.Types.ObjectId.isValid(item.variant)) {
        details.push({ field: `items[${index}].variant`, message: "Valid Variant ID reference is required." });
      }
      const qty = Number(item.quantity);
      if (item.quantity === undefined || item.quantity === null || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
        details.push({ field: `items[${index}].quantity`, message: "Quantity must be an integer >= 1." });
      }
    });
  }

  if (!body.shippingAddress) {
    details.push({ field: "shippingAddress", message: "Shipping address is required." });
  } else {
    const fields = ["street", "city", "state", "zipCode", "country"];
    fields.forEach(field => {
      if (!body.shippingAddress[field] || body.shippingAddress[field].trim() === "") {
        details.push({ field: `shippingAddress.${field}`, message: `${field} is required.` });
      }
    });
  }

  return details;
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError("User is not authenticated.");
    }

    const validationErrors = validateOrderPayload(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError("Order validation failed.", validationErrors);
    }

    const { items, shippingAddress, tax = 0, discount = 0 } = req.body;

    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, isActive: true }).session(session);
      if (!product) {
        throw new NotFoundError(`Active product with ID '${item.product}' not found.`);
      }

      const variant = await Variant.findOne({ _id: item.variant, productId: item.product, isActive: true }).session(session);
      if (!variant) {
        throw new NotFoundError(`Active variant with ID '${item.variant}' not found for product.`);
      }

      // Check stock availability
      if (variant.stockQuantity < item.quantity) {
        throw new ValidationError(`Insufficient stock for SKU ${variant.sku}.`, [
          { field: "quantity", message: `Requested ${item.quantity} but only ${variant.stockQuantity} remaining.` }
        ]);
      }

      // Decrement stock levels
      variant.stockQuantity -= item.quantity;
      await variant.save({ session });

      // Save stock movements ledger
      const history = new InventoryHistory({
        variantId: variant._id,
        productId: product._id,
        quantityChanged: -item.quantity,
        type: "order_allocation",
        performedBy: req.user._id,
        reason: `Checkout allocation for order`
      });
      await history.save({ session });

      // Check low stock and notify admin asynchronously after transaction
      const isOutOfStock = variant.stockQuantity === 0;
      const isLowStock = !isOutOfStock && variant.stockQuantity <= variant.lowStockThreshold;
      if (isOutOfStock || isLowStock) {
        notificationService.sendLowStockAlert(
          process.env.ADMIN_EMAIL || "admin@example.com",
          variant.sku,
          variant.stockQuantity,
          variant.lowStockThreshold
        ).catch(console.error);
      }

      const itemPrice = variant.salePrice !== undefined && variant.salePrice !== null ? variant.salePrice : variant.price;
      const subtotal = itemPrice * item.quantity;
      calculatedTotal += subtotal;

      orderItems.push({
        product: product._id,
        variant: variant._id,
        quantity: item.quantity,
        price: itemPrice,
        subtotal
      });
    }

    const finalOrderTotal = parseFloat(calculatedTotal.toFixed(2));
    const finalTax = parseFloat(Number(tax).toFixed(2));
    const finalDiscount = parseFloat(Number(discount).toFixed(2));
    const finalGrandTotal = parseFloat((finalOrderTotal + finalTax - finalDiscount).toFixed(2));

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: finalOrderTotal, // backward compatibility
      tax: finalTax,
      discount: finalDiscount,
      grandTotal: finalGrandTotal,
      shippingAddress,
      status: "Pending",
      paymentStatus: "Pending"
    });

    await order.save({ session });

    // Empty user's shopping cart
    const cart = await Cart.findOne({ user: req.user._id }).session(session);
    if (cart) {
      cart.items = [];
      cart.grandTotal = 0;
      await cart.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Invalidate Redis caches
    await deleteCache(`cart:${req.user._id}`);
    await deleteCache("admin:dashboard");
    await deleteCache(`orders:user:${req.user._id}`);

    // Trigger confirmation email
    notificationService.sendOrderConfirmationEmail(req.user.email, order).catch(console.error);

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name brand category images slug")
      .populate("items.variant", "sku size color");

    return successResponse(res, 201, "Order created successfully", populatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// POST /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new InvalidIdError("Invalid order ID format.");
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      throw new NotFoundError(`Order with ID '${id}' was not found.`);
    }

    // Authorization check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new UnauthorizedError("You are not authorized to cancel this order.");
    }

    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      throw new ValidationError(`Cannot cancel order. Current status is already '${order.status}'.`);
    }

    order.status = "Cancelled";
    await order.save({ session });

    // Restore stock levels
    for (const item of order.items) {
      const variant = await Variant.findById(item.variant).session(session);
      if (variant) {
        variant.stockQuantity += item.quantity;
        await variant.save({ session });

        // Log restore movement
        const history = new InventoryHistory({
          variantId: variant._id,
          productId: variant.productId,
          quantityChanged: item.quantity,
          type: "restock",
          performedBy: req.user._id,
          reason: `Order #${order._id} cancellation restock`
        });
        await history.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    await deleteCache("admin:dashboard");
    await deleteCache(`orders:user:${order.user}`);

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name brand category images slug")
      .populate("items.variant", "sku size color");

    return successResponse(res, 200, "Order cancelled successfully", populatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// GET /api/orders/my-orders (Protected)
const getOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError("User is not authenticated.");
    }

    const userId = req.user._id.toString();
    const cacheKey = `orders:user:${userId}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return successResponse(res, 200, "Orders retrieved successfully (cached)", cachedData);
    }

    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name brand category images slug")
      .populate("items.variant", "sku size color")
      .sort({ createdAt: -1 });

    await setCache(cacheKey, orders);

    return successResponse(res, 200, "Orders retrieved successfully", orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id (Protected)
const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new InvalidIdError("Invalid order ID format.");
    }

    const order = await Order.findById(id)
      .populate("items.product", "name brand category images slug")
      .populate("items.variant", "sku size color")
      .populate("user", "name email");

    if (!order) {
      throw new NotFoundError(`Order with ID '${id}' not found.`);
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new UnauthorizedError("You are not authorized to view this order.");
    }

    return successResponse(res, 200, "Order details retrieved successfully", order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders (Admin)
const adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name brand category images slug")
      .populate("items.variant", "sku size color")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "All orders retrieved successfully", orders);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new InvalidIdError("Invalid order ID format.");
    }

    const allowedStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Paid"];
    if (!status || !allowedStatuses.includes(status)) {
      throw new ValidationError(`Status must be one of: ${allowedStatuses.join(", ")}`);
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      throw new NotFoundError(`Order with ID '${id}' not found.`);
    }

    order.status = status;
    if (status === "Paid") {
      order.paymentStatus = "Paid";
    }
    await order.save();

    await deleteCache("admin:dashboard");
    await deleteCache(`orders:user:${order.user._id}`);

    // Notify status updates asynchronously
    notificationService.sendOrderStatusEmail(order.user.email, order).catch(console.error);

    return successResponse(res, 200, "Order status updated successfully", order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  cancelOrder,
  getOrderDetails,
  adminGetAllOrders,
  updateOrderStatus
};
