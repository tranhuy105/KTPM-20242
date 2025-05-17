const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @route   GET /api/v1/brands
 * @desc    Get all brands with pagination
 * @access  Public
 */
router.get("/", brandController.getAllBrands);

/**
 * @route   GET /api/v1/brands/with-product-counts
 * @desc    Get brands with product counts
 * @access  Public
 */
router.get("/with-product-counts", brandController.getBrandsWithProductCounts);

/**
 * @route   GET /api/v1/brands/:id
 * @desc    Get a brand by ID
 * @access  Public
 */
router.get("/:id", brandController.getBrandById);

/**
 * @route   GET /api/v1/brands/slug/:slug
 * @desc    Get a brand by slug
 * @access  Public
 */
router.get("/slug/:slug", brandController.getBrandBySlug);

/**
 * @route   POST /api/v1/brands
 * @desc    Create a new brand
 * @access  Private/Admin
 */
router.post("/", authMiddleware, adminMiddleware, brandController.createBrand);

/**
 * @route   PUT /api/v1/brands/:id
 * @desc    Update a brand
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  brandController.updateBrand
);

/**
 * @route   DELETE /api/v1/brands/:id
 * @desc    Delete a brand
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  brandController.deleteBrand
);

module.exports = router;
