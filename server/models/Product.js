const mongoose = require("mongoose");

/**
 * Product variant schema - represents different options of the same product
 * (e.g., different sizes, colors, etc.)
 */
const productVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
  },
  attributes: {
    type: Object,
    default: {},
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  inventoryQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  weight: {
    type: Number,
    min: 0,
    default: 0,
  },
  weightUnit: {
    type: String,
    enum: ["g", "kg", "lb", "oz"],
    default: "g",
  },
});

/**
 * Review schema for product reviews
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Main product schema
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // For simple products without variants
    price: {
      type: Number,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    // For products with variants
    variants: [productVariantSchema],
    // SEO fields
    seo: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    // Status
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Inventory management
    hasVariants: {
      type: Boolean,
      default: false,
    },
    inventoryQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    inventoryTracking: {
      type: Boolean,
      default: true,
    },
    // Reviews
    reviews: [reviewSchema],
    // Avg rating calculated field
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Define compound indexes
    indexes: [
      // For product search
      { name: "text", description: "text", "seo.keywords": "text" },
      // For category filtering with sorting
      { category: 1, createdAt: -1 },
      { category: 1, price: 1 },
      { category: 1, averageRating: -1 },
    ],
  }
);

// Virtual for checking if product is in stock
productSchema.virtual("inStock").get(function () {
  if (this.hasVariants) {
    return this.variants.some((variant) => variant.inventoryQuantity > 0);
  }
  return this.inventoryQuantity > 0;
});

// Pre-save middleware to ensure at least one image is marked as default
productSchema.pre("save", function (next) {
  if (this.images && this.images.length > 0) {
    const hasDefaultImage = this.images.some((img) => img.isDefault);
    if (!hasDefaultImage) {
      this.images[0].isDefault = true;
    }
  }
  next();
});

// Update average rating when reviews change
productSchema.methods.updateAverageRating = async function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce(
      (total, review) => total + review.rating,
      0
    );
    this.averageRating = sum / this.reviews.length;
    this.reviewCount = this.reviews.length;
  }
  await this.save();
};

// Method to update inventory
productSchema.methods.updateInventory = async function (
  quantity,
  variantId = null
) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (variant) {
      variant.inventoryQuantity = Math.max(
        0,
        variant.inventoryQuantity - quantity
      );
    }
  } else {
    this.inventoryQuantity = Math.max(0, this.inventoryQuantity - quantity);
  }
  await this.save();
};

module.exports = mongoose.model("Product", productSchema);
