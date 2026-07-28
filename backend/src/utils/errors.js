class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "RESOURCE_NOT_FOUND");
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = []) {
    super(message, 400, "VALIDATION_FAILED", details);
  }
}

class DuplicateError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "RESOURCE_ALREADY_EXISTS");
  }
}

class InvalidIdError extends AppError {
  constructor(message = "The product ID format provided is invalid.") {
    super(message, 400, "INVALID_ID_FORMAT");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication token is missing or invalid.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access denied. You do not have permission to access this resource.") {
    super(message, 403, "FORBIDDEN");
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  InvalidIdError,
  UnauthorizedError,
  ForbiddenError
};
