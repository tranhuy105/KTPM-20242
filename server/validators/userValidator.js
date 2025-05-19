const { body, param, query, validationResult } = require("express-validator");

/**
 * User validator middleware
 */
const userValidator = {
  /**
   * Validate user registration data
   */
  validateRegistration: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("phone").optional().trim(),

    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate login data
   */
  validateLogin: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password").trim().notEmpty().withMessage("Password is required"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate user ID parameter
   */
  validateUserId: [
    param("id").isMongoId().withMessage("Invalid user ID format"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate user profile update
   */
  validateUserUpdate: [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("phone").optional().trim(),

    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),

    body("preferences")
      .optional()
      .isObject()
      .withMessage("Preferences must be an object"),

    body("preferences.language")
      .optional()
      .isString()
      .withMessage("Language must be a string"),

    body("preferences.currency")
      .optional()
      .isString()
      .withMessage("Currency must be a string"),

    body("preferences.notifications")
      .optional()
      .isObject()
      .withMessage("Notifications must be an object"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  validateUserCreation: [
    body("username").trim().notEmpty().withMessage("Username is required"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("role")
      .optional()
      .isIn(["customer", "admin", "manager"])
      .withMessage("Role must be one of: customer, admin, manager"),

    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate password update
   */
  validatePasswordUpdate: [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate role change
   */
  validateRoleChange: [
    param("id").isMongoId().withMessage("Invalid user ID format"),

    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["customer", "admin", "manager"])
      .withMessage("Role must be one of: customer, admin, manager"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate active status toggle
   */
  validateActiveToggle: [
    param("id").isMongoId().withMessage("Invalid user ID format"),

    body("isActive").isBoolean().withMessage("isActive must be a boolean"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate user query parameters
   */
  validateUserQuery: [
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
      .isIn(["username", "email", "createdAt", "role"])
      .withMessage(
        "Sort field must be one of: username, email, createdAt, role"
      ),

    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),

    query("role")
      .optional()
      .isIn(["customer", "admin", "manager"])
      .withMessage("Role must be one of: customer, admin, manager"),

    query("isActive")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isActive must be true or false"),

    query("isVerified")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isVerified must be true or false"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
};

module.exports = userValidator;
