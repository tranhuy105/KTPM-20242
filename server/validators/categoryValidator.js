const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

/**
 * Category validator middleware
 */
const categoryValidator = {
  /**
   * Validate category query parameters
   */
  validateCategoryQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isString()
      .withMessage("Sort field must be a string"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
    query("isActive")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isActive must be true or false"),
    query("parent")
      .optional()
      .custom((value) => {
        if (value === "null") return true;
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid parent ID format");
        }
        return true;
      }),
    query("search")
      .optional()
      .isString()
      .withMessage("Search query must be a string"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate category ID parameter
   */
  validateCategoryId: [
    param("id").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid category ID format");
      }
      return true;
    }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate category slug parameter
   */
  validateCategorySlug: [
    param("slug").isString().withMessage("Category slug must be a string"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate category creation/update data
   */
  validateCategory: [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),
    body("slug")
      .optional()
      .isString()
      .withMessage("Slug must be a string")
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      ),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("parent")
      .optional()
      .custom((value) => {
        if (value === null) return true;
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid parent ID format");
        }
        return true;
      }),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    body("displayOrder")
      .optional()
      .isInt()
      .withMessage("Display order must be an integer"),
    body("seo").optional().isObject().withMessage("SEO must be an object"),
    body("seo.title")
      .optional()
      .isString()
      .withMessage("SEO title must be a string"),
    body("seo.description")
      .optional()
      .isString()
      .withMessage("SEO description must be a string"),
    body("seo.keywords")
      .optional()
      .isArray()
      .withMessage("SEO keywords must be an array"),
    body("seo.keywords.*")
      .optional()
      .isString()
      .withMessage("Each SEO keyword must be a string"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
};

module.exports = categoryValidator;
