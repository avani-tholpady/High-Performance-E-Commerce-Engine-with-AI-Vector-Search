const Order = require("../models/Order");
const paymentService = require("../services/paymentService");
const { successResponse } = require("../utils/apiResponse");
const { ValidationError, NotFoundError, UnauthorizedError } = require("../utils/errors");
const mongoose = require("mongoose");

// POST /api/payments/intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, provider } = req.body;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError("Valid order ID is required.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found.`);
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new UnauthorizedError("You do not have access to this order.");
    }

    // Amount is grandTotal * 100 in cents/paise
    const amount = Math.round(order.grandTotal * 100);

    const intent = await paymentService.createPaymentIntent({
      amount,
      currency: "usd",
      provider: provider || "stripe",
      orderId: order._id.toString()
    });

    order.paymentDetails = {
      paymentId: intent.paymentId,
      provider: provider || "stripe",
      clientSecret: intent.clientSecret
    };
    await order.save();

    return successResponse(res, 200, "Payment intent created successfully", intent);
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, provider } = req.body;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError("Valid order ID is required.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found.`);
    }

    const verification = await paymentService.verifyPayment({
      paymentId,
      orderId,
      signature,
      provider: provider || "stripe"
    });

    if (!verification.success) {
      order.paymentStatus = "Failed";
      await order.save();
      throw new ValidationError(verification.message || "Payment verification failed.");
    }

    order.paymentStatus = "Paid";
    order.status = "Confirmed";
    await order.save();

    // Invalidate Redis Cache
    const { deleteCache } = require("../config/redis");
    await deleteCache(`orders:user:${order.user}`);
    await deleteCache("admin:dashboard");

    return successResponse(res, 200, "Payment verified and order confirmed.", order);
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/webhook
const handleWebhook = async (req, res, next) => {
  try {
    const provider = req.query.provider || "stripe";
    const signature = req.headers["stripe-signature"] || req.headers["x-razorpay-signature"];

    const verification = await paymentService.verifyWebhookSignature({
      rawBody: req.body,
      signature,
      provider
    });

    if (verification.success && verification.orderId) {
      const order = await Order.findById(verification.orderId);
      if (order) {
        order.paymentStatus = "Paid";
        order.status = "Confirmed";
        await order.save();

        const { deleteCache } = require("../config/redis");
        await deleteCache(`orders:user:${order.user}`);
        await deleteCache("admin:dashboard");
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
  handleWebhook
};
