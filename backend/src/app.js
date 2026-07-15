const express = require("express");
const cors = require("cors");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const { successResponse } = require("./utils/apiResponse");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/api/health", (req, res) => {
  return successResponse(
    res,
    200,
    "Server is running successfully"
  );
});

// Keep these after all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;