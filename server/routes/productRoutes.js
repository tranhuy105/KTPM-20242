const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const productValidator = require("../validators/productValidator");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
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
 * @route   GET /api/products/wishlist
 * @desc    Get all products in user's wishlist
 * @access  Private
 */
router.get(
  "/wishlist",
  authMiddleware,
  productController.getWishlistProducts
);

/**
 * @route   GET /api/products/admin
 * @desc    Get all products for admin (including drafts)
 * @access  Private/Admin
 */
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  productValidator.validateProductQuery,
  productController.getAdminProducts
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
 * @route   GET /api/products/admin/id/:id
 * @desc    Get a product by ID (admin access, includes all products)
 * @access  Private/Admin
 */
router.get(
  "/admin/id/:id",
  authMiddleware,
  adminMiddleware,
  productValidator.validateProductId,
  productController.getProductByIdAdmin
);

/**
 * @route   GET /api/products/admin/slug/:slug
 * @desc    Get a product by slug (admin access, includes all products)
 * @access  Private/Admin
 */
router.get(
  "/admin/slug/:slug",
  authMiddleware,
  adminMiddleware,
  productValidator.validateProductSlug,
  productController.getProductBySlugAdmin
);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
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
  adminMiddleware,
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
  adminMiddleware,
  productValidator.validateProductId,
  productValidator.validateInventoryUpdate,
  productController.updateProductInventory
);

/**
 * @route   PUT /api/products/:id/featured
 * @desc    Toggle product featured status
 * @access  Private/Admin
 */
router.put(
  "/:id/featured",
  authMiddleware,
  adminMiddleware,
  productValidator.validateProductId,
  productValidator.validateFeatureToggle,
  productController.toggleProductFeatured
);

/**
 * @route   PUT /api/products/:id/published
 * @desc    Toggle product published status
 * @access  Private/Admin
 */
router.put(
  "/:id/published",
  authMiddleware,
  adminMiddleware,
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
  adminMiddleware,
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
  productValidator.validateProductId,
  productValidator.validateProductReview,
  productController.addProductReview
);

/**
 * @route   POST /api/products/:id/wishlist
 * @desc    Toggle product in wishlist
 * @access  Private
 */
router.post(
  "/:id/wishlist",
  authMiddleware,
  productValidator.validateProductId,
  productController.toggleProductInWishlist
);

module.exports = router;
