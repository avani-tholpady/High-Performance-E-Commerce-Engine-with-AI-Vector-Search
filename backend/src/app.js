const express = require("express");
const cors = require("cors");
const compression = require("compression");

const {
  helmetMiddleware,
  sanitizeMongo,
  preventXss,
  rateLimiter,
  authLimiter,
} = require("./middleware/security");

const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// =========================
// Middlewares
// =========================
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware
app.use(helmetMiddleware);

// Disabled temporarily because express-mongo-sanitize
// is not yet compatible with Express 5
// app.use(sanitizeMongo);

// app.use(preventXss);
app.use("/api", rateLimiter);

// =========================
// Health Check Route
// =========================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

// =========================
// API Routes
// =========================
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authLimiter, authRoutes);

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================
// 404 Middleware
// =========================
app.use(notFound);

// =========================
// Global Error Handler
// =========================
app.use(errorHandler);

module.exports = app;