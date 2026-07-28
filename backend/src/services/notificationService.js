/**
 * Notification Service for dispatching emails.
 * Uses console logging as a fallback/mock transport during local development and test execution.
 */
class NotificationService {
  /**
   * Helper to print formatted emails to server logs for debugging/auditing.
   */
  async sendEmail({ to, subject, html, text }) {
    console.log(`📧 [EMAIL SENT] to: "${to}" | Subject: "${subject}"`);
    if (process.env.DEBUG_EMAILS === "true") {
      console.log(`--- TEXT CONTENT ---\n${text || html}\n---------------------`);
    }
    return {
      messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      success: true
    };
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    return this.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      text: `Please verify your email address by clicking this link: ${verificationUrl}`,
      html: `<p>Please verify your email address by clicking <a href="${verificationUrl}">here</a>.</p>`
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    return this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click this link: ${resetUrl}`,
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to choose a new password.</p>`
    });
  }

  async sendOrderConfirmationEmail(email, order) {
    return this.sendEmail({
      to: email,
      subject: `Order Confirmation - #${order._id}`,
      text: `Thank you for your order! Total amount: $${order.grandTotal.toFixed(2)}. Status: ${order.status}`,
      html: `<h3>Thank you for your order!</h3><p>Total amount: <strong>$${order.grandTotal.toFixed(2)}</strong></p><p>Status: ${order.status}</p>`
    });
  }

  async sendOrderStatusEmail(email, order) {
    return this.sendEmail({
      to: email,
      subject: `Order Status Updated - #${order._id}`,
      text: `Your order status has been updated to: ${order.status}.`,
      html: `<p>Your order status has been updated to: <strong>${order.status}</strong>.</p>`
    });
  }

  async sendLowStockAlert(adminEmail, sku, currentStock, threshold) {
    return this.sendEmail({
      to: adminEmail,
      subject: `⚠️ LOW STOCK ALERT - ${sku}`,
      text: `Warning: SKU ${sku} is low on stock! Current stock: ${currentStock} (Threshold: ${threshold})`,
      html: `<h3>⚠️ Low Stock Alert</h3><p>SKU <strong>${sku}</strong> is low on stock!</p><p>Current stock: ${currentStock} (Threshold: ${threshold})</p>`
    });
  }
}

module.exports = new NotificationService();
