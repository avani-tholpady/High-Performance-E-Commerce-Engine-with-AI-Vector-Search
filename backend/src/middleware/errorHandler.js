const { AppError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.code = err.code || "INTERNAL_SERVER_ERROR";
  error.details = err.details || null;

  // Log error for developers in development/test
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  // Handle Mongoose / MongoDB errors if they weren't caught in controller
  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    error.statusCode = 400;
    error.code = "INVALID_ID_FORMAT";
    error.message = "The product ID format provided is invalid.";
  }

  // 2. MongoDB Duplicate Key (Code 11000)
  if (err.code === 11000) {
    error.statusCode = 409;
    error.code = "RESOURCE_ALREADY_EXISTS";
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    error.message = `A product with ${field} '${value}' already exists in the database.`;
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    error.statusCode = 400;
    error.code = "VALIDATION_FAILED";
    error.message = "The product payload submitted contains validation errors.";
    error.details = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
  }

  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  };

  if (error.details) {
    response.error.details = error.details;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;