const mongoose = require("mongoose");

/**
 * Order item schema - represents a product in an order
 */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  // Store variant ID if applicable
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  // Store product snapshot to preserve order history
  // even if the product is later modified or deleted
  productSnapshot: {
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String },
    imageUrl: { type: String },
  },
  // Store selected variant attributes if applicable
  variantAttributes: {
    type: Map,
    of: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Store any applied discounts
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

/**
 * Shipping information schema
 */
const shippingInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  carrier: {
    type: String,
  },
  trackingNumber: {
    type: String,
  },
  estimatedDelivery: {
    type: Date,
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  address: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
});

/**
 * Billing information schema
 */
const billingInfoSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    required: true,
  },
  // For display purposes only - never store actual card numbers
  lastFourDigits: {
    type: String,
  },
  cardType: {
    type: String,
  },
  // Billing address
  address: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
});

/**
 * Order status history entry
 */
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

/**
 * Main order schema with enhanced e-commerce functionality
 */
const orderSchema = new mongoose.Schema(
  {
    // Order number (human-readable identifier)
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Store user snapshot to preserve order history
    userSnapshot: {
      email: { type: String, required: true },
      name: { type: String, required: true },
    },
    products: [orderItemSchema],
    // Financial details
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    // Status tracking
    status: {
      type: String,
      enum: [
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
      ],
      default: "pending",
      index: true,
    },
    statusHistory: [statusHistorySchema],
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "paid",
        "partially_refunded",
        "refunded",
        "failed",
      ],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        "unfulfilled",
        "partially_fulfilled",
        "fulfilled",
        "returned",
        "partially_returned",
      ],
      default: "unfulfilled",
      index: true,
    },
    // Shipping and billing information
    shipping: shippingInfoSchema,
    billing: billingInfoSchema,
    // Discounts and promotions
    couponCode: {
      type: String,
    },
    // Notes
    customerNote: {
      type: String,
    },
    internalNotes: [
      {
        note: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // IP address for fraud detection
    ipAddress: {
      type: String,
    },
    // Metadata for integrations with external systems
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Define valid state transitions for order status
orderSchema.statics.STATE_MACHINE = {
  // Initial state can transition to these states
  pending: ["processing", "payment_pending", "cancelled", "on_hold"],

  // After payment is initiated but not completed
  payment_pending: ["pending", "processing", "paid", "cancelled", "on_hold"],

  // Order is being processed
  processing: ["shipped", "on_hold", "cancelled"],

  // Payment confirmed
  paid: ["processing", "on_hold", "cancelled"],

  // Order is shipped
  shipped: ["delivered", "on_hold"],

  // Order is delivered to customer
  delivered: [],

  // Order is cancelled
  cancelled: [], // Terminal state - no further transitions

  // Order is refunded
  refunded: [], // Terminal state - no further transitions

  // Order is partially refunded
  partially_refunded: ["refunded"],

  // Order is on hold
  on_hold: ["pending", "processing", "cancelled"],

  // Order is returned
  returned: ["refunded", "partially_refunded"],
};

// Method to validate status transition
orderSchema.methods.canTransitionTo = function (newStatus) {
  const currentStatus = this.status;
  // Allow same status (no transition)
  if (currentStatus === newStatus) return true;

  // Check if transition is valid
  const validTransitions = this.constructor.STATE_MACHINE[currentStatus] || [];
  return validTransitions.includes(newStatus);
};

// Generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only set order number if it's not already set
    if (!this.orderNumber) {
      try {
        // Get current date in YYYYMMDD format
        const now = new Date();
        const datePrefix = `${now.getFullYear()}${String(
          now.getMonth() + 1
        ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

        // Find the highest order number with the same date prefix
        const lastOrder = await this.constructor.findOne(
          { orderNumber: new RegExp(`^${datePrefix}`) },
          { orderNumber: 1 },
          { sort: { orderNumber: -1 } }
        );

        // Extract sequential number or start from 1
        let sequentialNumber = 1;
        if (lastOrder && lastOrder.orderNumber) {
          const match = lastOrder.orderNumber.match(/\d{8}-(\d+)/);
          if (match && match[1]) {
            sequentialNumber = parseInt(match[1], 10) + 1;
          }
        }

        // Format: YYYYMMDD-XXXX (where XXXX is a sequential number)
        this.orderNumber = `${datePrefix}-${String(sequentialNumber).padStart(
          4,
          "0"
        )}`;
      } catch (error) {
        return next(error);
      }
    }

    // Initialize status history with initial status
    this.statusHistory = [
      {
        status: this.status,
      },
    ];
  } else if (this.isModified("status")) {
    // Check if there's already a recent entry with this status in the history
    // that might have been added manually by the updateOrderStatus method
    const recentEntries = this.statusHistory.slice(-1);

    if (recentEntries.length === 0 || recentEntries[0].status !== this.status) {
      // Only add to status history if this is a new status not already logged
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
      });
    }
  }

  next();
});

// Method to get valid next statuses
orderSchema.methods.getValidNextStatuses = function () {
  return this.constructor.STATE_MACHINE[this.status] || [];
};

// Method to add internal note
orderSchema.methods.addNote = async function (note, userId) {
  this.internalNotes.push({
    note,
    createdBy: userId,
  });
  return this.save();
};

// Method to update payment status - simplified since transactions are not yet implemented
orderSchema.methods.setPaymentStatus = function (status) {
  if (
    [
      "pending",
      "authorized",
      "paid",
      "partially_refunded",
      "refunded",
      "failed",
    ].includes(status)
  ) {
    this.paymentStatus = status;
  }
};

// Method to add tracking information
orderSchema.methods.addTracking = async function (
  carrier,
  trackingNumber,
  estimatedDelivery = null
) {
  this.shipping.carrier = carrier;
  this.shipping.trackingNumber = trackingNumber;

  if (estimatedDelivery) {
    this.shipping.estimatedDelivery = estimatedDelivery;
  }

  // Update fulfillment status
  if (this.fulfillmentStatus === "unfulfilled") {
    this.fulfillmentStatus = "fulfilled";

    // Only change status to shipped if it's a valid transition
    if (this.canTransitionTo("shipped")) {
      this.status = "shipped";

      // Add to status history
      this.statusHistory.push({
        status: "shipped",
        comment: `Shipped via ${carrier} with tracking number ${trackingNumber}`,
      });
    }
  }

  return this.save();
};

module.exports = mongoose.model("Order", orderSchema);
