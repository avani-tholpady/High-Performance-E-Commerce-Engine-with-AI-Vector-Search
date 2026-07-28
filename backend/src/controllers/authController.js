const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  ValidationError,
  DuplicateError,
  UnauthorizedError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_123456";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Helper to generate JWT token for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const details = [];

    // Simple manual validation
    if (!name || name.trim() === "") {
      details.push({ field: "name", message: "Name is required." });
    }
    if (!email || email.trim() === "") {
      details.push({ field: "email", message: "Email is required." });
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      details.push({ field: "email", message: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      details.push({ field: "password", message: "Password must be at least 6 characters." });
    }

    if (details.length > 0) {
      throw new ValidationError("Registration validation failed.", details);
    }

    // Check duplicate user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new DuplicateError(`User with email '${email}' already exists.`);
    }

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    await user.save();

    const token = generateToken(user._id);

    return successResponse(res, 201, "User registered successfully", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const details = [];

    if (!email || email.trim() === "") {
      details.push({ field: "email", message: "Email is required." });
    }
    if (!password || password.trim() === "") {
      details.push({ field: "password", message: "Password is required." });
    }

    if (details.length > 0) {
      throw new ValidationError("Login validation failed.", details);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
