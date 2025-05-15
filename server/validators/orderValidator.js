const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

/**
 * Order validator middleware
 */
const orderValidator = {
  /**
   * Validate order query parameters
   */
  validateOrderQuery: [
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
    query("status")
      .optional()
      .isString()
      .withMessage("Status must be a string"),
    query("paymentStatus")
      .optional()
      .isString()
      .withMessage("Payment status must be a string"),
    query("fulfillmentStatus")
      .optional()
      .isString()
      .withMessage("Fulfillment status must be a string"),
    query("userId")
      .optional()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid user ID format");
        }
        return true;
      }),
    query("dateFrom")
      .optional()
      .isISO8601()
      .withMessage("Date from must be in ISO format"),
    query("dateTo")
      .optional()
      .isISO8601()
      .withMessage("Date to must be in ISO format"),
    query("minTotal")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum total must be a positive number"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search query must be a string"),
    query("period")
      .optional()
      .isIn(["DAILY", "WEEKLY", "MONTHLY"])
      .withMessage("Period must be DAILY, WEEKLY, or MONTHLY"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate order ID parameter
   */
  validateOrderId: [
    param("id").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid order ID format");
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
   * Validate order creation data
   */
  validateCreateOrder: [
    body("products")
      .isArray({ min: 1 })
      .withMessage("Order must have at least one product"),
    body("products.*.productId")
      .isMongoId()
      .withMessage("Invalid product ID format"),
    body("products.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Product quantity must be at least 1"),
    body("products.*.variantId")
      .optional()
      .isMongoId()
      .withMessage("Invalid variant ID format"),
    body("shipping").isObject().withMessage("Shipping information is required"),
    body("shipping.method")
      .notEmpty()
      .withMessage("Shipping method is required"),
    body("shipping.cost")
      .isFloat({ min: 0 })
      .withMessage("Shipping cost must be a non-negative number"),
    body("shipping.address")
      .isObject()
      .withMessage("Shipping address is required"),
    body("shipping.address.fullName")
      .notEmpty()
      .withMessage("Full name is required for shipping address"),
    body("shipping.address.addressLine1")
      .notEmpty()
      .withMessage("Address line 1 is required for shipping address"),
    body("shipping.address.city")
      .notEmpty()
      .withMessage("City is required for shipping address"),
    body("shipping.address.state")
      .notEmpty()
      .withMessage("State is required for shipping address"),
    body("shipping.address.postalCode")
      .notEmpty()
      .withMessage("Postal code is required for shipping address"),
    body("shipping.address.country")
      .notEmpty()
      .withMessage("Country is required for shipping address"),
    body("billing").isObject().withMessage("Billing information is required"),
    body("billing.paymentMethod")
      .notEmpty()
      .withMessage("Payment method is required"),
    body("billing.address")
      .isObject()
      .withMessage("Billing address is required"),
    body("billing.address.fullName")
      .notEmpty()
      .withMessage("Full name is required for billing address"),
    body("billing.address.addressLine1")
      .notEmpty()
      .withMessage("Address line 1 is required for billing address"),
    body("billing.address.city")
      .notEmpty()
      .withMessage("City is required for billing address"),
    body("billing.address.state")
      .notEmpty()
      .withMessage("State is required for billing address"),
    body("billing.address.postalCode")
      .notEmpty()
      .withMessage("Postal code is required for billing address"),
    body("billing.address.country")
      .notEmpty()
      .withMessage("Country is required for billing address"),
    body("taxAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Tax amount must be a non-negative number"),
    body("discountTotal")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount total must be a non-negative number"),
    body("couponCode").optional().isString(),
    body("customerNote").optional().isString(),
    body("ipAddress")
      .optional()
      .isIP()
      .withMessage("Invalid IP address format"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate order status update data
   */
  validateOrderStatus: [
    body("status")
      .notEmpty()
      .isIn([
        "pending",
        "processing",
        "payment_pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "partially_refunded",
        "on_hold",
      ])
      .withMessage("Invalid order status"),
    body("comment").optional().isString(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate transaction data
   */
  validateTransaction: [
    body("orderId").isMongoId().withMessage("Invalid order ID format"),
    body("type")
      .isIn(["payment", "refund", "capture", "authorization"])
      .withMessage("Invalid transaction type"),
    body("status")
      .isIn(["pending", "completed", "failed", "cancelled"])
      .withMessage("Invalid transaction status"),
    body("gateway").notEmpty().withMessage("Payment gateway is required"),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than zero"),
    body("currency").optional().isString().isLength({ min: 3, max: 3 }),
    body("gatewayTransactionId").optional().isString(),
    body("gatewayResponse").optional(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate tracking information
   */
  validateTracking: [
    body("carrier").notEmpty().withMessage("Carrier name is required"),
    body("trackingNumber")
      .notEmpty()
      .withMessage("Tracking number is required"),
    body("estimatedDelivery")
      .optional()
      .isISO8601()
      .withMessage("Estimated delivery date must be in ISO format"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate cancellation data
   */
  validateCancellation: [
    body("reason").optional().isString(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate order note
   */
  validateOrderNote: [
    body("note").notEmpty().withMessage("Note content is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],

  /**
   * Validate refund data
   */
  validateRefund: [
    body("orderId").isMongoId().withMessage("Invalid order ID format"),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Refund amount must be greater than zero"),
    body("reason").optional().isString(),
    body("gateway").optional().isString(),
    body("gatewayTransactionId").optional().isString(),
    body("gatewayResponse").optional(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
};

module.exports = orderValidator;
