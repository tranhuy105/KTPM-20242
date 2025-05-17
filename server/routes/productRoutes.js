const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const productValidator = require("../validators/productValidator");
const { authMiddleware } = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
/**
 * @route   GET /api/products/filters
 * @desc    Get available filters for products
 * @access  Public
 */
router.get(
  "/filters",
  cacheMiddleware(1800), // Cache for 30 minutes
  productController.getAvailableFilters
);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filtering
 * @access  Public
 */
router.get(
  "/",
  productValidator.validateProductQuery,
  productController.getAllProducts
);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get("/featured", productController.getFeaturedProducts);

/**
 * @route   GET /api/products/new-arrivals
 * @desc    Get new arrivals
 * @access  Public
 */
router.get("/new-arrivals", productController.getNewArrivals);

/**
 * @route   GET /api/products/best-sellers
 * @desc    Get best sellers
 * @access  Public
 */
router.get("/best-sellers", productController.getBestSellers);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get a product by slug
 * @access  Public
 */
router.get(
  "/slug/:slug",
  productValidator.validateProductSlug,
  productController.getProductBySlug
);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products for a product
 * @access  Public
 */
router.get(
  "/:id/related",
  productValidator.validateProductId,
  productController.getRelatedProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
router.get(
  "/:id",
  productValidator.validateProductId,
  productController.getProductById
);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  productValidator.validateProduct,
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  productValidator.validateProductId,
  productValidator.validateProduct,
  productController.updateProduct
);

/**
 * @route   PATCH /api/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private/Admin
 */
router.patch(
  "/:id/inventory",
  authMiddleware,
  productValidator.validateProductId,
  productValidator.validateInventoryUpdate,
  productController.updateProductInventory
);

/**
 * @route   PATCH /api/products/:id/featured
 * @desc    Toggle product featured status
 * @access  Private/Admin
 */
router.patch(
  "/:id/featured",
  authMiddleware,
  productValidator.validateProductId,
  productValidator.validateFeatureToggle,
  productController.toggleProductFeatured
);

/**
 * @route   PATCH /api/products/:id/publish
 * @desc    Toggle product published status
 * @access  Private/Admin
 */
router.patch(
  "/:id/publish",
  authMiddleware,
  productValidator.validateProductId,
  productValidator.validatePublishToggle,
  productController.toggleProductPublished
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  productValidator.validateProductId,
  productController.deleteProduct
);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Add a review to a product
 * @access  Private
 */
router.post(
  "/:id/reviews",
  authMiddleware,
  productValidator.validateProductReview,
  productController.addProductReview
);

module.exports = router;
