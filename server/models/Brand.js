const mongoose = require("mongoose");

/**
 * Brand schema for product brands
 */
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
    // Track products count for efficient filtering
    productsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Define text index for search
    indexes: [{ name: "text", description: "text" }],
  }
);

// Helper method to generate slug from name
brandSchema.statics.generateSlug = function (name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Update products count
brandSchema.methods.updateProductsCount = async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({ brand: this._id });
  this.productsCount = count;
  return this.save();
};

// Pre-save hook to generate slug if not provided
brandSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.constructor.generateSlug(this.name);
  }
  next();
});

module.exports = mongoose.model("Brand", brandSchema);
