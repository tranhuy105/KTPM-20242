const userService = require("../services/userService");

/**
 * User Controller - Handles HTTP requests and responses for users
 */
class UserController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async registerUser(req, res) {
    try {
      const result = await userService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Create a new user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      // Admin can set custom role and active status
      const userData = {
        ...req.body,
        // Default to active if not specified
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        // If role is not specified, default to customer
        role: req.body.role || "customer",
      };

      const result = await userService.createUser(userData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Admin user creation error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.loginUser(email, password);
      res.json(result);
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
      const user = await userService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Get all users with pagination (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllUsers(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: {
          role: req.query.role,
          isActive:
            req.query.isActive === "true"
              ? true
              : req.query.isActive === "false"
              ? false
              : undefined,
          isVerified:
            req.query.isVerified === "true"
              ? true
              : req.query.isVerified === "false"
              ? false
              : undefined,
          search: req.query.search,
        },
      };

      const result = await userService.getAllUsers(options);
      res.json(result);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      console.error("Get user by ID error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      // For security, regular users can only update their own profile
      if (req.user.role !== "admin" && req.params.id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this user" });
      }

      // Don't allow role changes via this endpoint for security
      if (req.body.role && req.user.role !== "admin") {
        delete req.body.role;
      }

      const user = await userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Update user error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message === "Email already in use" ||
        error.message === "Username already in use"
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Delete a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      // For security, regular users can only delete their own account
      if (req.user.role !== "admin" && req.params.id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this user" });
      }

      await userService.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Update user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // For security, users can only change their own password
      if (req.params.id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to change this user's password" });
      }

      await userService.updatePassword(
        req.params.id,
        currentPassword,
        newPassword
      );
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Current password is incorrect") {
        return res.status(401).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Change user role (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changeUserRole(req, res) {
    try {
      const { role } = req.body;
      const user = await userService.changeUserRole(req.params.id, role);
      res.json({
        message: `User role changed to ${role}`,
        user,
      });
    } catch (error) {
      console.error("Change user role error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Invalid role")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Toggle user active status (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleUserActive(req, res) {
    try {
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({ error: "isActive field is required" });
      }

      const user = await userService.toggleUserActive(req.params.id, isActive);
      res.json({
        message: `User ${isActive ? "activated" : "deactivated"}`,
        user,
      });
    } catch (error) {
      console.error("Toggle user active error:", error);

      if (
        error.message === "Invalid user ID format" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = new UserController();
