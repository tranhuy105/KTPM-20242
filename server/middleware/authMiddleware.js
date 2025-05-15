const { User } = require("../models");
const { verifyToken, extractTokenFromHeader } = require("../utils/jwtUtils");

/**
 * Authentication Middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required. No token provided." });
    }

    try {
      // Verify JWT token
      const decoded = verifyToken(token);

      // Find user from token data
      const user = await User.findById(decoded.id).select(
        "-password -passwordResetToken"
      );

      if (!user) {
        return res.status(401).json({ error: "User not found or deleted." });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: "Account is deactivated." });
      }

      // Add user data to request object
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || user.role === "admin",
      };

      next();
    } catch (err) {
      console.error("JWT verification error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Admin Access Middleware
 */
const adminMiddleware = (req, res, next) => {
  // Check if user exists and is admin (either by isAdmin flag or role)
  if (!req.user || !(req.user.isAdmin || req.user.role === "admin")) {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }

  next();
};

/**
 * Admin or Manager Access Middleware
 */
const adminOrManagerMiddleware = (req, res, next) => {
  // Check if user exists and is admin or manager
  if (
    !req.user ||
    !(
      req.user.isAdmin ||
      req.user.role === "admin" ||
      req.user.role === "manager"
    )
  ) {
    return res
      .status(403)
      .json({ error: "Access denied. Admin or manager privileges required." });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  adminOrManagerMiddleware,
};
