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
 * Transaction schema - for payment tracking
 */
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["payment", "refund", "capture", "authorization"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    required: true,
  },
  gateway: {
    type: String,
    required: true,
  },
  gatewayTransactionId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  gatewayResponse: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
    // Payment transactions
    transactions: [transactionSchema],
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
    // Add to status history if status changed
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }

  next();
});

// Method to add internal note
orderSchema.methods.addNote = async function (note, userId) {
  this.internalNotes.push({
    note,
    createdBy: userId,
  });
  return this.save();
};

// Method to update payment status based on transactions
orderSchema.methods.updatePaymentStatus = async function () {
  const totalPaid = this.transactions
    .filter((t) => t.type === "payment" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = this.transactions
    .filter((t) => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const netPayment = totalPaid - totalRefunded;

  if (netPayment <= 0 && totalRefunded > 0) {
    this.paymentStatus = "refunded";
  } else if (totalRefunded > 0) {
    this.paymentStatus = "partially_refunded";
  } else if (Math.abs(netPayment - this.totalAmount) < 0.01) {
    this.paymentStatus = "paid";
  } else if (netPayment > 0) {
    this.paymentStatus = "partially_paid";
  } else {
    this.paymentStatus = "pending";
  }

  return this.save();
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
    this.status = "shipped";

    // Add to status history
    this.statusHistory.push({
      status: "shipped",
      comment: `Shipped via ${carrier} with tracking number ${trackingNumber}`,
    });
  }

  return this.save();
};

module.exports = mongoose.model("Order", orderSchema);
