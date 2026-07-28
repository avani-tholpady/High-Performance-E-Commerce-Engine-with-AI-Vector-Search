const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  ValidationError,
  DuplicateError,
  UnauthorizedError,
  NotFoundError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");
const notificationService = require("../services/notificationService");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_123456";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_key_654321";

/**
 * Helper to generate access token.
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "15m"
  });
};

/**
 * Helper to generate refresh token.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const details = [];

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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new DuplicateError(`User with email '${email}' already exists.`);
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || "user",
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // Trigger email notification asynchronously
    notificationService.sendVerificationEmail(user.email, verificationToken).catch(console.error);

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, 201, "User registered successfully. Verification email sent.", {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, 200, "Login successful", {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required.");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      throw new UnauthorizedError("Invalid or expired refresh token.");
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      throw new UnauthorizedError("Token is revoked or user does not exist.");
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return successResponse(res, 200, "Token refreshed successfully", {
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ValidationError("Verification token is invalid or has expired.");
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return successResponse(res, 200, "Email verified successfully");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required.", [{ field: "email", message: "Email is required." }]);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak user existence in production, but return 200 success response
      return successResponse(res, 200, "If that email exists in our system, we've sent a password reset link.");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    notificationService.sendPasswordResetEmail(user.email, resetToken).catch(console.error);

    return successResponse(res, 200, "Password reset link generated and sent.");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters.", [{ field: "password", message: "Password must be at least 6 characters." }]);
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ValidationError("Password reset token is invalid or has expired.");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return successResponse(res, 200, "Password has been reset successfully");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const details = [];

    if (!currentPassword) {
      details.push({ field: "currentPassword", message: "Current password is required." });
    }
    if (!newPassword || newPassword.length < 6) {
      details.push({ field: "newPassword", message: "New password must be at least 6 characters." });
    }

    if (details.length > 0) {
      throw new ValidationError("Validation failed.", details);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError("Incorrect current password.");
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
      throw new NotFoundError("User profile not found.");
    }
    return successResponse(res, 200, "Profile retrieved successfully", user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError("User profile not found.");
    }

    if (name && name.trim() !== "") {
      user.name = name.trim();
    }
    if (email && email.trim() !== "" && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new DuplicateError(`Email '${email}' is already in use.`);
      }
      user.email = email.trim().toLowerCase();
      user.isEmailVerified = false; // Reset verification if email changes
    }

    await user.save();
    return successResponse(res, 200, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile
};
