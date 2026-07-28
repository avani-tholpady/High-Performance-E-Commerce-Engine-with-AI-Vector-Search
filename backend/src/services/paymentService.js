/**
 * Payment Service abstraction layer for Stripe and Razorpay integrations.
 * Keeps implementation independent of the underlying payment gateway.
 */
class PaymentService {
  /**
   * Generates a payment intent token or transaction identifier.
   */
  async createPaymentIntent({ amount, currency = "usd", provider = "stripe", orderId }) {
    const paymentId = `${provider === "stripe" ? "pi" : "pay"}_mock_${Date.now()}`;
    return {
      success: true,
      paymentId,
      amount,
      currency,
      provider,
      orderId,
      clientSecret: `${paymentId}_secret_${Math.floor(Math.random() * 100000)}`
    };
  }

  /**
   * Client-side signature verification (e.g. for Razorpay callback verification).
   */
  async verifyPayment({ paymentId, orderId, signature, provider = "stripe" }) {
    // Mock validation logic
    if (signature && signature.includes("invalid")) {
      return {
        success: false,
        message: "Invalid payment signature verification failed."
      };
    }
    return {
      success: true,
      paymentId,
      orderId,
      status: "Paid"
    };
  }

  /**
   * Webhook event parsing and validation.
   */
  async verifyWebhookSignature({ rawBody, signature, provider = "stripe" }) {
    // Mock parsing webhook event
    let payload = {};
    try {
      payload = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch (e) {
      payload = {};
    }

    return {
      success: true,
      orderId: payload.orderId || (payload.data && payload.data.object ? payload.data.object.metadata?.orderId : null),
      status: "succeeded",
      paymentId: payload.id || (payload.data && payload.data.object ? payload.data.object.id : null)
    };
  }
}

module.exports = new PaymentService();
