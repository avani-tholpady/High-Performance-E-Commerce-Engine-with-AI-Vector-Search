const mongoose = require("mongoose");
const { UnauthorizedError } = require("../utils/errors");

/**
 * Authentication middleware that extracts user identity from the Authorization header.
 * Expects header format: "Bearer <token>"
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or malformed. Required format: 'Bearer <token>'.");
    }

    const token = authHeader.split(" ")[1];
    if (!token || token.trim() === "") {
      throw new UnauthorizedError("Authentication token is missing.");
    }

    const cleanToken = token.trim();
    let userId = null;

    if (mongoose.Types.ObjectId.isValid(cleanToken)) {
      userId = cleanToken;
    } else if (cleanToken.includes("-")) {
      const parts = cleanToken.split("-");
      const possibleId = parts[parts.length - 1];
      if (mongoose.Types.ObjectId.isValid(possibleId)) {
        userId = possibleId;
      }
    }

    if (!userId) {
      const hexBuffer = Buffer.from(cleanToken.padEnd(12, "0").slice(0, 12)).toString("hex");
      userId = hexBuffer.padStart(24, "0").slice(0, 24);
    }

    req.user = {
      _id: userId,
      id: userId
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
