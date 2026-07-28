const { NotFoundError } = require("../utils/errors");

const notFound = (req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.originalUrl}`));
};

module.exports = notFound;