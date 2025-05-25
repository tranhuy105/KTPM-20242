const { User } = require("../models");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtUtils");
const crypto = require("crypto");
const emailService = require("../utils/emailUtils");

/**
 * User Service - Business logic for user operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Registered user and token
   */
  async registerUser(userData) {
    try {
      // Check if email already exists
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw new Error("Email already in use");
      }

      // Check if username already exists
      const existingUsername = await User.findOne({
        username: userData.username,
      });
      if (existingUsername) {
        throw new Error("Username already in use");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user with hashed password
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user (without password) and token
      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - Logged in user and token
   */
  async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      // Generate token
      const token = this.generateToken(user);

      // Return user and token
      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} - User data
   */
  async getUserById(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Pagination and filter options
   * @returns {Object} - Users and pagination data
   */
  async getAllUsers(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};

      if (options.filters) {
        if (options.filters.role) {
          filter.role = options.filters.role;
        }
        if (options.filters.isActive !== undefined) {
          filter.isActive = options.filters.isActive;
        }
        if (options.filters.isVerified !== undefined) {
          filter.isVerified = options.filters.isVerified;
        }
        if (options.filters.search) {
          filter.$or = [
            { username: { $regex: options.filters.search, $options: "i" } },
            { email: { $regex: options.filters.search, $options: "i" } },
            { firstName: { $regex: options.filters.search, $options: "i" } },
            { lastName: { $regex: options.filters.search, $options: "i" } },
          ];
        }
      }

      // Build sort
      const sortField = options.sortBy || "createdAt";
      const sortOrder = options.sortOrder === "asc" ? 1 : -1;
      const sort = { [sortField]: sortOrder };

      // Execute query with pagination
      const users = await User.find(filter)
        .select("-password -passwordResetToken")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalCount = await User.countDocuments(filter);

      const sanitizedUsers = users.map((user) => this.sanitizeUser(user));

      return {
        users: sanitizedUsers,
        pagination: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: skip + users.length < totalCount,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Object} - Updated user
   */
  async updateUser(userId, userData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if updating email and if it's already in use
      if (userData.email && userData.email !== user.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          throw new Error("Email already in use");
        }
      }

      // Check if updating username and if it's already in use
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await User.findOne({
          username: userData.username,
        });
        if (existingUsername) {
          throw new Error("Username already in use");
        }
      }

      // Hash password if it's being updated
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: userData },
        { new: true, runValidators: true }
      ).select("-password -passwordResetToken");

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Boolean} - Success status
   */
  async deleteUser(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await User.findByIdAndDelete(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Boolean} - Success status
   */
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Object} - Updated user
   */
  async changeUserRole(userId, role) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const validRoles = ["customer", "admin", "manager"];
      if (!validRoles.includes(role)) {
        throw new Error(
          `Invalid role. Must be one of: ${validRoles.join(", ")}`
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role, isAdmin: role === "admin" }, // Update isAdmin for backwards compatibility
        { new: true }
      ).select("-password -passwordResetToken");

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle user active status
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Object} - Updated user
   */
  async toggleUserActive(userId, isActive) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      ).select("-password -passwordResetToken");

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Object} - User profile
   */
  async getCurrentUser(userId) {
    try {
      return await this.getUserById(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper to generate JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    return generateToken(user);
  }

  /**
   * Helper to remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user object
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };

    // Remove sensitive fields
    delete userObj.password;
    delete userObj.passwordResetToken;

    return userObj;
  }

  /**
   * Create a new user (admin only)
   * @param {Object} userData - User data
   * @returns {Object} - Created user object (without token)
   */
  async createUser(userData) {
    try {
      // Check if email already exists
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw new Error("Email already in use");
      }

      // Check if username already exists
      const existingUsername = await User.findOne({
        username: userData.username,
      });
      if (existingUsername) {
        throw new Error("Username already in use");
      }

      // Validate role if provided
      if (userData.role) {
        const validRoles = ["customer", "admin", "manager"];
        if (!validRoles.includes(userData.role)) {
          throw new Error(
            `Invalid role. Must be one of: ${validRoles.join(", ")}`
          );
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user with hashed password
      const user = new User({
        ...userData,
        password: hashedPassword,
        isAdmin: userData.role === "admin", // Set isAdmin for backward compatibility
      });

      await user.save();

      // For admin-created users, don't return a token
      // Just return the user object
      return {
        user: this.sanitizeUser(user),
        message: "User created successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initiate forgot password process
   * @param {string} email - User email address
   * @returns {boolean} - Success status
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // For security reasons, always return success even if email doesn't exist
        return true;
      }

      // Check if there was a recent password reset request (15 minutes)
      const resetCooldown = 15 * 60 * 1000; // 15 minutes in milliseconds
      if (
        user.passwordResetExpires &&
        Date.now() <
          user.passwordResetExpires -
            (process.env.PASSWORD_RESET_EXPIRATION || 3600000) +
            resetCooldown
      ) {
        // A reset email was recently sent (within cooldown period)
        // For security, still return success but don't actually send another email
        return true;
      }

      // Generate a reset token and expiration
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

      // Calculate reset token expiration (1 hour default)
      const expiresIn =
        parseInt(process.env.PASSWORD_RESET_EXPIRATION) || 3600000;

      // Store the hashed token and expiration in the user document
      user.passwordResetToken = hash;
      user.passwordResetExpires = new Date(Date.now() + expiresIn);
      await user.save();

      // Send password reset email - do not await to prevent blocking
      emailService
        .sendPasswordResetEmail(user.email, resetToken, user.username)
        .catch((error) => {
          console.error("Failed to send password reset email:", error);
        });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {boolean} - Success status
   */
  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored hash
      const hash = crypto.createHash("sha256").update(token).digest("hex");

      // Find user with matching token and valid expiration
      const user = await User.findOne({
        passwordResetToken: hash,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error("Invalid or expired token");
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Send confirmation email if user has email notifications enabled
      if (user.preferences?.notifications?.email !== false) {
        try {
          await emailService.sendPasswordResetConfirmation(
            user.email,
            user.username
          );
        } catch (error) {
          console.error(
            "Failed to send password reset confirmation email:",
            error
          );
          // Don't throw here - password was still reset successfully
        }
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}


module.exports = new UserService();
