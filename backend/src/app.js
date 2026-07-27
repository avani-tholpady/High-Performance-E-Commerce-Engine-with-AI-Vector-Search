const express = require("express");
const cors = require("cors");
const compression = require("compression");

const {
  helmetMiddleware,
  sanitizeMongo,
  preventXss,
  rateLimiter,
  authLimiter
} = require("./middleware/security");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const variantRoutes = require("./routes/variantRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app = express();

// =========================
// Middlewares
// =========================
app.use(cors());
app.use(compression()); // Compress all responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware
app.use(helmetMiddleware);

// Disabled temporarily because express-mongo-sanitize
// is not yet compatible with Express 5
// app.use(sanitizeMongo);

//app.use(preventXss);
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