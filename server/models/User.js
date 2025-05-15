const mongoose = require("mongoose");

/**
 * Address schema for user shipping and billing addresses
 */
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

/**
 * Wishlist item schema
 */
const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * User schema with extended e-commerce functionality
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Personal information
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Profile picture
    avatar: {
      type: String,
    },
    // User status and roles
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "manager"],
      default: "customer",
      index: true,
    },
    // Legacy support for isAdmin
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Account preferences
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "USD",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
      },
    },
    // E-commerce specific
    addresses: [addressSchema],
    wishlist: [wishlistItemSchema],
    // Customer data
    customerData: {
      totalSpent: {
        type: Number,
        default: 0,
      },
      orderCount: {
        type: Number,
        default: 0,
      },
      lastOrderDate: {
        type: Date,
      },
    },
    // Security
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Method to add product to wishlist
userSchema.methods.addToWishlist = async function (
  productId,
  variantId = null
) {
  // Check if already in wishlist
  const exists = this.wishlist.some(
    (item) =>
      item.product.toString() === productId &&
      (variantId ? item.variant?.toString() === variantId : true)
  );

  if (!exists) {
    const wishlistItem = {
      product: productId,
      ...(variantId && { variant: variantId }),
    };
    this.wishlist.push(wishlistItem);
    await this.save();
  }

  return this.wishlist;
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = async function (
  productId,
  variantId = null
) {
  // Find the item index
  const index = this.wishlist.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (variantId ? item.variant?.toString() === variantId : true)
  );

  if (index !== -1) {
    this.wishlist.splice(index, 1);
    await this.save();
  }

  return this.wishlist;
};

// Method to set default address
userSchema.methods.setDefaultAddress = async function (addressId) {
  // Reset all addresses
  this.addresses.forEach((address) => {
    address.isDefault = false;
  });

  // Set the new default
  const address = this.addresses.id(addressId);
  if (address) {
    address.isDefault = true;
    await this.save();
    return address;
  }

  throw new Error("Address not found");
};

// Method to update customer data after an order
userSchema.methods.updateCustomerData = async function (orderTotal) {
  this.customerData.totalSpent += orderTotal;
  this.customerData.orderCount += 1;
  this.customerData.lastOrderDate = new Date();
  return this.save();
};

// Pre-save hook to ensure role and isAdmin are in sync
userSchema.pre("save", function (next) {
  // Update isAdmin based on role for backward compatibility
  this.isAdmin = this.role === "admin";
  next();
});

module.exports = mongoose.model("User", userSchema);
