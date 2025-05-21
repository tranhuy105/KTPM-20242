const mongoose = require("mongoose");

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
    // Enhanced brand field with reference to Brand collection
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },
    // Keep string brand for backward compatibility
    brandName: {
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
    // Additional categories for cross-categorization
    additionalCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
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
      index: true, // Index for price filtering
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },
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
    // Remove status field
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
      index: true, // Index for rating filtering
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Additional fields for filtering
    color: {
      type: String,
      trim: true,
      index: true,
    },
    size: {
      type: String,
      trim: true,
      index: true,
    },
    material: {
      type: String,
      trim: true,
      index: true,
    },
    // Key product attributes for filtering (dynamic)
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Date fields for filtering
    releaseDate: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    // Define compound indexes
    indexes: [
      // For product search
      {
        name: "text",
        description: "text",
        shortDescription: "text",
        brandName: "text",
        tags: "text",
        "seo.keywords": "text",
      },
      // For category filtering with sorting
      { category: 1, createdAt: -1 },
      { category: 1, price: 1 },
      { category: 1, averageRating: -1 },
      // For brand filtering with sorting
      { brand: 1, createdAt: -1 },
      { brand: 1, price: 1 },
      // For price range filtering
      { price: 1 },
      // For combined filters
      { category: 1, brand: 1, price: 1 },
      { category: 1, brand: 1, averageRating: -1 },
      // For published and featured filtering
      { isPublished: 1 },
      { isFeatured: 1 },
      { isPublished: 1, isFeatured: 1 },
    ],
  }
);

// Virtual for checking if product is in stock
productSchema.virtual("inStock").get(function () {
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

  // Ensure brandName is set if brand is set (for backward compatibility)
  if (this.isModified("brand") && this.brand) {
    // This will be populated in a separate step if needed
    // We can't do it here because it would require an async operation
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
productSchema.methods.updateInventory = async function (quantity) {
  this.inventoryQuantity = Math.max(0, this.inventoryQuantity - quantity);
  await this.save();
};

// Static method to get available filters
productSchema.statics.getAvailableFilters = async function () {
  // Get distinct brand IDs first
  const brandIds = await this.distinct("brand");
  // Then populate them with Brand model info and sort alphabetically by name
  const brands = await mongoose
    .model("Brand")
    .find({
      _id: { $in: brandIds },
    })
    .select("_id name slug logo")
    .sort({ name: 1 });

  // Get distinct category IDs first
  const categoryIds = await this.distinct("category");

  // Get all categories including parent info for hierarchical organization
  const categories = await mongoose
    .model("Category")
    .find({
      _id: { $in: categoryIds },
    })
    .select("_id name slug image parent ancestors")
    .sort({ name: 1 });

  // Structure categories hierarchically
  const topLevelCategories = [];
  const categoryMap = {};

  // First pass: create a map of categories by ID
  categories.forEach((category) => {
    categoryMap[category._id] = {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      children: [],
    };
  });

  // Second pass: organize into hierarchy
  categories.forEach((category) => {
    const categoryId = category._id.toString();
    if (!category.parent) {
      topLevelCategories.push(categoryMap[categoryId]);
    } else {
      const parentId = category.parent.toString();
      if (categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[categoryId]);
      } else {
        // If parent is not in our list (not associated with products),
        // treat as top-level
        topLevelCategories.push(categoryMap[categoryId]);
      }
    }
  });

  const colors = await this.distinct("color");
  const sizes = await this.distinct("size");
  const materials = await this.distinct("material");
  const minPrice = await this.find()
    .sort({ price: 1 })
    .limit(1)
    .select("price");
  const maxPrice = await this.find()
    .sort({ price: -1 })
    .limit(1)
    .select("price");

  return {
    brands,
    categories: {
      flat: categories, // Keep flat list for backward compatibility
      hierarchical: topLevelCategories, // Add hierarchical structure
    },
    colors,
    sizes,
    materials,
    priceRange: {
      min: minPrice.length > 0 ? minPrice[0].price : 0,
      max: maxPrice.length > 0 ? maxPrice[0].price : 0,
    },
  };
};

module.exports = mongoose.model("Product", productSchema);
