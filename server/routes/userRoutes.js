const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userValidator = require("../validators/userValidator");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  userValidator.validateRegistration,
  userController.registerUser
);

/**
 * @route   POST /api/users/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post("/login", userValidator.validateLogin, userController.loginUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authMiddleware, userController.getCurrentUser);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  userValidator.validateUserQuery,
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin or Self
 */
router.get(
  "/:id",
  authMiddleware,
  userValidator.validateUserId,
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (self or admin)
 */
router.put(
  "/:id",
  authMiddleware,
  userValidator.validateUserId,
  userValidator.validateUserUpdate,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (self or admin)
 */
router.delete(
  "/:id",
  authMiddleware,
  userValidator.validateUserId,
  userController.deleteUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private (self only)
 */
router.put(
  "/:id/password",
  authMiddleware,
  userValidator.validateUserId,
  userValidator.validatePasswordUpdate,
  userController.updatePassword
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change user role (admin only)
 * @access  Private/Admin
 */
router.patch(
  "/:id/role",
  authMiddleware,
  adminMiddleware,
  userValidator.validateRoleChange,
  userController.changeUserRole
);

/**
 * @route   PATCH /api/users/:id/active
 * @desc    Toggle user active status (admin only)
 * @access  Private/Admin
 */
router.patch(
  "/:id/active",
  authMiddleware,
  adminMiddleware,
  userValidator.validateActiveToggle,
  userController.toggleUserActive
);

module.exports = router;
