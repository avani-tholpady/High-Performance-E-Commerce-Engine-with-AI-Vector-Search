const express = require("express");
const cors = require("cors");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

// Keep these after all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;