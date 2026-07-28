const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

// Limit requests to prevent brute force / spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message:
        "Too many requests from this IP, please try again after 15 minutes.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  helmetMiddleware: helmet(),
  sanitizeMongo: mongoSanitize(),
  preventXss: xss(),
  rateLimiter: limiter,
};