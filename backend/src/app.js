const express = require("express");
const cors = require("cors");

const helmet = require("helmet");
const productRoutes = require("./routes/productRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// =========================
// Middlewares
// =========================
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

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

// =========================
// 404 Middleware
// =========================
app.use(notFound);

// =========================
// Global Error Handler
// =========================
app.use(errorHandler);

module.exports = app;