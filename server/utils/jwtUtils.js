const jwt = require("jsonwebtoken");

/**
 * JWT Utility Functions
 */

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id, username, email, role, isAdmin
 * @param {string} expiresIn - Token expiration time (default: 30d)
 * @returns {string} - JWT token
 */
const generateToken = (user, expiresIn = "30d") => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin || user.role === "admin",
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null if invalid
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return token || null;
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};
