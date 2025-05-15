const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const categoryValidator = require("../validators/categoryValidator");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const { validationErrorHandler } = require("../middleware/errorMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories with pagination and filtering
 * @access  Public
 */
router.get(
  "/",
  cacheMiddleware(60), // Cache for 60 seconds
  categoryValidator.validateCategoryQuery,
  validationErrorHandler,
  categoryController.getAllCategories
);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get a category by slug
 * @access  Public
 */
router.get(
  "/slug/:slug",
  cacheMiddleware(300), // Cache for 5 minutes
  categoryValidator.validateCategorySlug,
  validationErrorHandler,
  categoryController.getCategoryBySlug
);

/**
 * @route   GET /api/v1/categories/:id/children
 * @desc    Get children of a category
 * @access  Public
 */
router.get(
  "/:id/children",
  cacheMiddleware(180), // Cache for 3 minutes
  categoryValidator.validateCategoryId,
  validationErrorHandler,
  categoryController.getCategoryChildren
);

/**
 * @route   GET /api/v1/categories/root
 * @desc    Get root categories (with null parent)
 * @access  Public
 */
router.get(
  "/root",
  cacheMiddleware(300), // Cache for 5 minutes
  (req, res) => {
    req.params.id = null;
    categoryController.getCategoryChildren(req, res);
  }
);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get a category by ID
 * @access  Public
 */
router.get(
  "/:id",
  cacheMiddleware(300), // Cache for 5 minutes
  categoryValidator.validateCategoryId,
  validationErrorHandler,
  categoryController.getCategoryById
);

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryValidator.validateCategory,
  validationErrorHandler,
  categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update a category
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryValidator.validateCategoryId,
  categoryValidator.validateCategory,
  validationErrorHandler,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a category
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryValidator.validateCategoryId,
  validationErrorHandler,
  categoryController.deleteCategory
);

module.exports = router;
