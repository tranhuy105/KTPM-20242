const { Order, Product, User } = require("../models");
const mongoose = require("mongoose");

/**
 * Order Service - Business logic for order operations
 */
class OrderService {
    /**
     * Get all orders with optional filtering and pagination
     * @param {Object} options - Query options (pagination, filters)
     * @returns {Promise<Object>} - Orders and pagination data
     */
    async getAllOrders(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        if (options.filters) {
            if (options.filters.status) {
                filter.status = options.filters.status;
            }

            if (options.filters.paymentStatus) {
                filter.paymentStatus =
                    options.filters.paymentStatus;
            }

            if (options.filters.fulfillmentStatus) {
                filter.fulfillmentStatus =
                    options.filters.fulfillmentStatus;
            }

            if (options.filters.userId) {
                filter.user = options.filters.userId;
            }

            if (
                options.filters.dateFrom ||
                options.filters.dateTo
            ) {
                filter.createdAt = {};
                if (options.filters.dateFrom) {
                    filter.createdAt.$gte = new Date(
                        options.filters.dateFrom
                    );
                }
                if (options.filters.dateTo) {
                    filter.createdAt.$lte = new Date(
                        options.filters.dateTo
                    );
                }
            }

            if (options.filters.minTotal) {
                filter.totalAmount = {
                    $gte: Number(options.filters.minTotal),
                };
            }

            if (options.filters.search) {
                filter.$or = [
                    {
                        orderNumber: {
                            $regex: options.filters.search,
                            $options: "i",
                        },
                    },
                    {
                        "userSnapshot.email": {
                            $regex: options.filters.search,
                            $options: "i",
                        },
                    },
                    {
                        "userSnapshot.name": {
                            $regex: options.filters.search,
                            $options: "i",
                        },
                    },
                ];
            }
        }

        // Build sort object
        const sortField = options.sortBy || "createdAt";
        const sortOrder =
            options.sortOrder === "asc" ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        // Execute query with pagination
        const orders = await Order.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate(
                "user",
                "firstName lastName email username"
            );

        // Get total count for pagination
        const totalCount = await Order.countDocuments(
            filter
        );

        return {
            orders,
            pagination: {
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage:
                    skip + orders.length < totalCount,
                hasPrevPage: page > 1,
            },
        };
    }

    /**
     * Get a single order by ID
     * @param {string} id - Order ID
     * @param {string} userId - User ID (for authorization)
     * @param {boolean} isAdmin - Whether user is admin
     * @returns {Promise<Object>} - Order object
     */
    async getOrderById(id, userId, isAdmin) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid order ID format");
        }

        const order = await Order.findById(id)
            .populate(
                "user",
                "firstName lastName email username"
            )
            .populate({
                path: "products.product",
                select: "name slug images",
            });

        if (!order) {
            throw new Error("Order not found");
        }

        // Check if user is authorized to view this order
        if (
            !isAdmin &&
            order.user._id.toString() !== userId
        ) {
            throw new Error(
                "Not authorized to view this order"
            );
        }

        // Get valid next statuses for this order (useful for the frontend)
        const validNextStatuses = order.getValidNextStatuses();

        // Convert to plain object to add additional properties
        const orderObject = order.toObject();
        orderObject.validNextStatuses = validNextStatuses;

        return orderObject;
    }

    /**
     * Get orders for a specific user
     * @param {string} userId - User ID
     * @param {Object} options - Query options (pagination, filters)
     * @returns {Promise<Object>} - Orders and pagination data
     */
    async getUserOrders(userId, options = {}) {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter for user's orders
      const filter = { user: userId };

      // Add status filter if provided
      if (options.status) {
        filter.status = options.status;
      }

      // Get total count for pagination
      const totalCount = await Order.countDocuments(filter);

      // Determine sort options
      let sortOptions = { createdAt: -1 }; // Default sort

      if (options.sortBy) {
        const sortOrder = options.sortOrder === "asc" ? 1 : -1;
        sortOptions = { [options.sortBy]: sortOrder };
      }

      // Execute query with pagination
      const orders = await Order.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      return {
        orders,
        pagination: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: skip + orders.length < totalCount,
          hasPrevPage: page > 1,
        },
      };
    }

    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Created order
     */
    async createOrder(orderData, userId) {
      // Validate products input
      if (!orderData.products || orderData.products.length === 0) {
        throw new Error("Order must contain at least one product");
      }

      // Get user data
      const userData = await User.findById(userId);
      if (!userData) {
        throw new Error("User not found");
      }

      // Create basic order structure
      const newOrderData = {
        orderNumber: generateOrderNumber(),
        user: userId,
        userSnapshot: {
          email: userData.email,
          name: userData.fullName || userData.username,
        },
        products: [],
        shipping: orderData.shipping,
        billing: orderData.billing,
        customerNote: orderData.customerNote,
        ipAddress: orderData.ipAddress,
      };

      // Process each product
      let subtotal = 0;
      for (const item of orderData.products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Check if the product is published and active
        if (!product.isPublished) {
          throw new Error(
            `Product "${product.name}" is not available for purchase`
          );
        }

        let price, variantData, inventoryCheck;

        // Handle variants if specified
        if (item.variantId) {
          if (!product.hasVariants) {
            throw new Error(`Product "${product.name}" does not have variants`);
          }

          const variant = product.variants.id(item.variantId);
          if (!variant) {
            throw new Error(`Variant not found for product "${product.name}"`);
          }

          price = variant.price;
          variantData = variant;
          inventoryCheck = variant.inventoryQuantity >= item.quantity;
        } else {
          if (product.hasVariants) {
            throw new Error(
              `Must specify a variant for product "${product.name}"`
            );
          }

          price = product.price;
          inventoryCheck = product.inventoryQuantity >= item.quantity;
        }

        // Check inventory if tracking is enabled
        if (product.inventoryTracking && !inventoryCheck) {
          throw new Error(`Not enough inventory for product "${product.name}"`);
        }

        // Calculate item total
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        // Add to order products
        newOrderData.products.push({
          product: product._id,
          variant: item.variantId,
          productSnapshot: {
            name: product.name,
            description: product.shortDescription || product.description || "",
            sku: item.variantId ? variantData.sku : product.sku,
            imageUrl:
              product.images && product.images.length > 0
                ? product.images.find((img) => img.isDefault)?.url ||
                  product.images[0].url
                : null,
          },
          variantAttributes: item.variantId ? variantData.attributes : null,
          quantity: item.quantity,
          price: price,
          itemTotal: itemTotal,
        });
      }

      // Set financial details
      newOrderData.subtotal = subtotal;
      newOrderData.shippingCost = orderData.shipping?.cost || 0;
      newOrderData.taxAmount = orderData.taxAmount || 0;
      newOrderData.discountTotal = orderData.discountTotal || 0;
      newOrderData.totalAmount =
        subtotal +
        newOrderData.shippingCost +
        newOrderData.taxAmount -
        newOrderData.discountTotal;

      // Apply coupon code if provided
      if (orderData.couponCode) {
        newOrderData.couponCode = orderData.couponCode;
      }

      // Create the order
      const order = new Order(newOrderData);

      // hiện tại mock payment feature nên set payment status thành paid luôn
      order.paymentStatus = "paid";

      const savedOrder = await order.save();

      // Update inventory
      for (const item of newOrderData.products) {
        if (item.variant) {
          await Product.updateOne(
            {
              _id: item.product,
              "variants._id": item.variant,
            },
            {
              $inc: {
                "variants.$.inventoryQuantity": -item.quantity,
              },
            }
          );
        } else {
          await Product.updateOne(
            { _id: item.product },
            {
              $inc: {
                inventoryQuantity: -item.quantity,
              },
            }
          );
        }
      }

      // Update user's customer data
      await userData.updateCustomerData(newOrderData.totalAmount);

      return savedOrder;
    }

    /**
     * Update order status
     * @param {string} id - Order ID
     * @param {string} status - New status
     * @param {string} comment - Optional comment
     * @param {string} userId - User ID of admin
     * @returns {Promise<Object>} - Updated order
     */
    async updateOrderStatus(id, status, comment, userId) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid order ID format");
      }

      const order = await Order.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // Validate status transition
      if (!order.canTransitionTo(status)) {
        throw new Error(
          `Invalid status transition from '${order.status}' to '${status}'`
        );
      }

      // Update status
      order.status = status;

      // Add to status history
      order.statusHistory.push({
        status,
        comment,
        updatedBy: userId,
      });

      // Update fulfillment status if applicable
      if (status === "shipped") {
        order.fulfillmentStatus = "fulfilled";
      } else if (status === "delivered") {
        order.fulfillmentStatus = "fulfilled";
      } else if (status === "cancelled") {
        order.fulfillmentStatus = "unfulfilled";
      }

      // Hard code payment status to paid for now
      order.paymentStatus = "paid";

      await order.save();
      return order;
    }

    /**
     * Add tracking information to an order
     * @param {string} id - Order ID
     * @param {string} carrier - Shipping carrier
     * @param {string} trackingNumber - Tracking number
     * @param {Date} estimatedDelivery - Estimated delivery date
     * @returns {Promise<Object>} - Updated order
     */
    async addOrderTracking(
        id,
        carrier,
        trackingNumber,
        estimatedDelivery
    ) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid order ID format");
        }

        const order = await Order.findById(id);
        if (!order) {
            throw new Error("Order not found");
        }

        // Validate if order can transition to shipped status
        if (!order.canTransitionTo("shipped")) {
            throw new Error(
                `Cannot add tracking to order with status '${order.status}'. The order must be in a state that can transition to 'shipped'.`
            );
        }

        // Add tracking information
        await order.addTracking(
            carrier,
            trackingNumber,
            estimatedDelivery
        );

        return order;
    }

    /**
     * Cancel an order
     * @param {string} id - Order ID
     * @param {string} reason - Cancellation reason
     * @param {string} userId - User ID
     * @param {boolean} isAdmin - Whether user is admin
     * @returns {Promise<Object>} - Updated order
     */
    async cancelOrder(id, reason, userId, isAdmin) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid order ID format");
        }

        const order = await Order.findById(id);
        if (!order) {
            throw new Error("Order not found");
        }

        // Only allow admin or the order owner to cancel
        if (!isAdmin && order.user.toString() !== userId) {
            throw new Error(
                "Not authorized to cancel this order"
            );
        }

        // Check if order can be canceled using state machine
        if (!order.canTransitionTo('cancelled')) {
            throw new Error(
                `Cannot cancel order with status '${order.status}'. Invalid state transition.`
            );
        }

        // Update status
        order.status = "cancelled";

        // Add to status history
        order.statusHistory.push({
            status: "cancelled",
            comment: reason || "Cancelled by user",
            updatedBy: userId,
        });

        // Update fulfillment status
        order.fulfillmentStatus = "unfulfilled";

        // Restore inventory
        for (const item of order.products) {
            if (item.variant) {
                await Product.updateOne(
                    {
                        _id: item.product,
                        "variants._id": item.variant,
                    },
                    {
                        $inc: {
                            "variants.$.inventoryQuantity":
                                item.quantity,
                        },
                    }
                );
            } else {
                await Product.updateOne(
                    { _id: item.product },
                    {
                        $inc: {
                            inventoryQuantity:
                                item.quantity,
                        },
                    }
                );
            }
        }

        await order.save();
        return order;
    }

    /**
     * Add a note to an order
     * @param {string} id - Order ID
     * @param {string} note - Note content
     * @param {string} userId - User ID of admin
     * @returns {Promise<Object>} - Updated order
     */
    async addOrderNote(id, note, userId) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid order ID format");
        }

        const order = await Order.findById(id);
        if (!order) {
            throw new Error("Order not found");
        }

        // Add note
        await order.addNote(note, userId);

        return order;
    }

    /**
     * Get order dashboard data for admin
     * @returns {Promise<Object>} - Dashboard data
     */
    async getOrdersDashboard() {
        // Get counts by status
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get counts by payment status
        const paymentStatusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get total sales
        const salesData = await Order.aggregate([
            {
                $match: {
                    status: {
                        $nin: ["cancelled", "refunded"],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" },
                },
            },
        ]);

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "firstName lastName email");

        // Format status counts
        const formattedStatusCounts = {};
        statusCounts.forEach((item) => {
            formattedStatusCounts[item._id] = item.count;
        });

        // Format payment status counts
        const formattedPaymentStatusCounts = {};
        paymentStatusCounts.forEach((item) => {
            formattedPaymentStatusCounts[item._id] =
                item.count;
        });

        return {
            totalSales:
                salesData.length > 0
                    ? salesData[0].total
                    : 0,
            totalOrders: await Order.countDocuments(),
            statusCounts: formattedStatusCounts,
            paymentStatusCounts:
                formattedPaymentStatusCounts,
            recentOrders,
        };
    }

    /**
     * Get sales statistics by time period
     * @param {string} period - Time period (DAILY, WEEKLY, MONTHLY)
     * @returns {Promise<Array>} - Sales data
     */
    async getSalesStats(period = "DAILY") {
        const now = new Date();
        let dateFormat, startDate;

        // Set the date range and grouping based on period
        switch (period.toUpperCase()) {
            case "DAILY":
                // Last 30 days
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                dateFormat = {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                };
                break;

            case "WEEKLY":
                // Last 12 weeks
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 84); // 12 weeks
                dateFormat = {
                    $dateToString: {
                        format: "%Y-%V", // ISO week format
                        date: "$createdAt",
                    },
                };
                break;

            case "MONTHLY":
                // Last 12 months
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 12);
                dateFormat = {
                    $dateToString: {
                        format: "%Y-%m",
                        date: "$createdAt",
                    },
                };
                break;

            default:
                throw new Error(
                    "Invalid period. Must be DAILY, WEEKLY, or MONTHLY"
                );
        }

        // Run the aggregation
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: {
                        $nin: ["cancelled", "refunded"],
                    },
                },
            },
            {
                $addFields: { dateStr: dateFormat },
            },
            {
                $group: {
                    _id: "$dateStr",
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // Transform to expected format
        return salesData.map((item) => ({
            date: item._id,
            totalSales: item.totalSales,
            orderCount: item.count,
        }));
    }
}

module.exports = new OrderService();

/**
 * Generate a unique order number
 * @returns {string} - Unique order number
 */
function generateOrderNumber() {
    const prefix = "ORD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    return `${prefix}-${timestamp}-${randomSuffix}`;
}
