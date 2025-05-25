const userService = require("../services/userService");
const { validationResult } = require("express-validator");

/**
 * Auth Controller - Handle authentication related requests
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userData = req.body;
      const result = await userService.registerUser(userData);

      res.status(201).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await userService.loginUser(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getCurrentUser(userId);

      res.status(200).json(user);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Forgot password - send reset email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async forgotPassword(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      await userService.forgotPassword(email);

      // Always return success for security (don't reveal if email exists)
      res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;
      await userService.resetPassword(token, password);

      res
        .status(200)
        .json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
