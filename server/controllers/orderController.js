const orderService = require("../services/orderService");

/**
 * Order Controller - Handles HTTP requests and responses for orders
 */
class OrderController {
  /**
   * Get all orders with pagination and filtering (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllOrders(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: {
          status: req.query.status,
          paymentStatus: req.query.paymentStatus,
          fulfillmentStatus: req.query.fulfillmentStatus,
          userId: req.query.userId,
          dateFrom: req.query.dateFrom,
          dateTo: req.query.dateTo,
          minTotal: req.query.minTotal,
          search: req.query.search,
        },
      };

      const result = await orderService.getAllOrders(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Get a single order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user.id,
        req.user.isAdmin
      );
      res.json(order);
    } catch (error) {
      console.error("Error fetching order by ID:", error);

      if (
        error.message === "Invalid order ID format" ||
        error.message === "Order not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Not authorized to view this order") {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get orders for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyOrders(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
      };

      const result = await orderService.getUserOrders(req.user.id, options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({
        error: error.message || "Server error",
      });
    }
  }

  /**
   * Create a new order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.body, req.user.id);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update order status (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateOrderStatus(req, res) {
    try {
      const { status, comment } = req.body;
      const order = await orderService.updateOrderStatus(
        req.params.id,
        status,
        comment,
        req.user.id
      );
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);

      if (
        error.message === "Invalid order ID format" ||
        error.message === "Order not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Add tracking information to an order (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addOrderTracking(req, res) {
    try {
      const { carrier, trackingNumber, estimatedDelivery } = req.body;
      const order = await orderService.addOrderTracking(
        req.params.id,
        carrier,
        trackingNumber,
        estimatedDelivery
      );
      res.json(order);
    } catch (error) {
      console.error("Error adding order tracking:", error);

      if (
        error.message === "Invalid order ID format" ||
        error.message === "Order not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cancel an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelOrder(req, res) {
    try {
      const order = await orderService.cancelOrder(
        req.params.id,
        req.body.reason,
        req.user.id,
        req.user.isAdmin
      );
      res.json(order);
    } catch (error) {
      console.error("Error cancelling order:", error);

      if (
        error.message === "Invalid order ID format" ||
        error.message === "Order not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Not authorized to cancel this order") {
        return res.status(403).json({ error: error.message });
      }

      if (error.message.startsWith("Cannot cancel order with status")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Add a note to an order (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addOrderNote(req, res) {
    try {
      const order = await orderService.addOrderNote(
        req.params.id,
        req.body.note,
        req.user.id
      );
      res.json(order);
    } catch (error) {
      console.error("Error adding order note:", error);

      if (
        error.message === "Invalid order ID format" ||
        error.message === "Order not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get orders dashboard data (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrdersDashboard(req, res) {
    try {
      const dashboardData = await orderService.getOrdersDashboard();
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching orders dashboard:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get sales statistics (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSalesStats(req, res) {
    try {
      const statsData = await orderService.getSalesStats(req.query.period);
      res.json(statsData);
    } catch (error) {
      console.error("Error fetching sales stats:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();
