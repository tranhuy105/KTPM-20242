const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const orderValidator = require("../validators/orderValidator");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

/**
 * @route   GET /api/orders
 * @desc    Get all orders with pagination and filtering (admin only)
 * @access  Private/Admin
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  orderValidator.validateOrderQuery,
  orderController.getAllOrders
);

/**
 * @route   GET /api/orders/my
 * @desc    Get current user's orders
 * @access  Private
 */
router.get(
  "/my",
  authMiddleware,
  orderValidator.validateOrderQuery,
  orderController.getMyOrders
);

/**
 * @route   GET /api/orders/dashboard
 * @desc    Get orders dashboard data for admin
 * @access  Private/Admin
 */
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  orderController.getOrdersDashboard
);

/**
 * @route   GET /api/orders/stats
 * @desc    Get sales statistics
 * @access  Private/Admin
 */
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  orderValidator.validateOrderQuery,
  orderController.getSalesStats
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get a order by ID
 * @access  Private
 */
router.get(
  "/:id",
  authMiddleware,
  orderValidator.validateOrderId,
  orderController.getOrderById
);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  "/",
  authMiddleware,
  orderValidator.validateCreateOrder,
  orderController.createOrder
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  orderValidator.validateOrderId,
  orderValidator.validateOrderStatus,
  orderController.updateOrderStatus
);

/**
 * @route   PUT /api/orders/:id/tracking
 * @desc    Add tracking information to order
 * @access  Private/Admin
 */
router.put(
  "/:id/tracking",
  authMiddleware,
  adminMiddleware,
  orderValidator.validateOrderId,
  orderValidator.validateTracking,
  orderController.addOrderTracking
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.put(
  "/:id/cancel",
  authMiddleware,
  orderValidator.validateOrderId,
  orderValidator.validateCancellation,
  orderController.cancelOrder
);

/**
 * @route   POST /api/orders/:id/note
 * @desc    Add note to order
 * @access  Private/Admin
 */
router.post(
  "/:id/note",
  authMiddleware,
  adminMiddleware,
  orderValidator.validateOrderId,
  orderValidator.validateOrderNote,
  orderController.addOrderNote
);

module.exports = router;
