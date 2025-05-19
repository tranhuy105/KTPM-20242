const { body, param, query, validationResult } = require("express-validator");

/**
 * Product Validators - Validation middleware for product operations
 */
const productValidator = {
  /**
   * Validate product creation/update
   */
  validateProduct: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 200 })
      .withMessage("Product name cannot exceed 200 characters"),

    body("slug")
      .trim()
      .notEmpty()
      .withMessage("Product slug is required")
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      )
      .isLength({ max: 200 })
      .withMessage("Slug cannot exceed 200 characters"),

    body("description").optional().trim(),

    body("shortDescription")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Short description cannot exceed 500 characters"),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("status")
      .optional()
      .isIn(["draft", "active", "archived"])
      .withMessage("Invalid status value"),

    body("hasVariants")
      .optional()
      .isBoolean()
      .withMessage("hasVariants must be a boolean"),

    body("inventoryQuantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Inventory quantity must be a non-negative integer"),

    body("category")
      .optional()
      .isMongoId()
      .withMessage("Invalid category ID format"),

    body("variants")
      .optional()
      .isArray()
      .withMessage("Variants must be an array"),

    body("variants.*.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Variant name is required"),

    body("variants.*.sku")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Variant SKU is required"),

    body("variants.*.price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Variant price must be a positive number"),

    body("variants.*.inventoryQuantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Variant inventory quantity must be a non-negative integer"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate product ID parameter
   */
  validateProductId: [
    param("id").isMongoId().withMessage("Invalid product ID format"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate product slug parameter
   */
  validateProductSlug: [
    param("slug")
      .trim()
      .notEmpty()
      .withMessage("Product slug is required")
      .matches(/^[a-z0-9-]+$/)
      .withMessage("Invalid slug format"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate product review creation
   */
  validateProductReview: [
    param("id").isMongoId().withMessage("Invalid product ID format"),

    body("user").isMongoId().withMessage("Invalid user ID format"),

    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("title")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),

    body("content")
      .trim()
      .notEmpty()
      .withMessage("Review content is required")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review content must be between 10 and 1000 characters"),

    body("isVerifiedPurchase")
      .optional()
      .isBoolean()
      .withMessage("isVerifiedPurchase must be a boolean"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate pagination and filter parameters
   */
  validateProductQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("cursor")
      .optional()
      .notEmpty()
      .withMessage("Cursor cannot be empty if provided"),

    query("cursorDirection")
      .optional()
      .isIn(["next", "prev"])
      .withMessage("Cursor direction must be 'next' or 'prev'"),

    query("sortBy")
      .optional()
      .isIn(["name", "price", "createdAt", "averageRating"])
      .withMessage("Invalid sort field"),

    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),

    query("category")
      .optional()
      .isMongoId()
      .withMessage("Invalid category ID format"),

    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum price must be a positive number"),

    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum price must be a positive number"),

    query("status")
      .optional()
      .isIn(["draft", "active", "archived"])
      .withMessage("Invalid status value"),

    query("isFeatured")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isFeatured must be true or false"),

    query("isPublished")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isPublished must be true or false"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate inventory update request
   */
  validateInventoryUpdate: [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),

    body("variantId")
      .optional()
      .isMongoId()
      .withMessage("Invalid variant ID format"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate featured status toggle
   */
  validateFeatureToggle: [
    body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate published status toggle
   */
  validatePublishToggle: [
    body("isPublished")
      .isBoolean()
      .withMessage("isPublished must be a boolean"),

    // Apply validation
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
};

module.exports = productValidator;
