const mongoose = require("mongoose");

/**
 * Category schema for product categorization
 * Supports nested categories with parent-child relationships
 */
const categorySchema = new mongoose.Schema(
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
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    // For storing the full path of category ancestors
    // Useful for breadcrumbs and efficient hierarchy queries
    ancestors: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
      },
    ],
    image: {
      type: String,
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
    // Additional metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Track products count for efficient filtering
    productsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Enable virtual population of children
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for child categories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Update ancestors array when parent changes
categorySchema.pre("save", async function (next) {
  // Skip if parent hasn't changed or is null
  if (!this.isModified("parent") || !this.parent) {
    return next();
  }

  try {
    const parent = await this.constructor.findById(this.parent);

    if (!parent) {
      return next(new Error("Parent category not found"));
    }

    // Set ancestors: parent's ancestors + parent itself
    this.ancestors = [
      ...(parent.ancestors || []),
      {
        _id: parent._id,
        name: parent.name,
        slug: parent.slug,
      },
    ];

    next();
  } catch (error) {
    next(error);
  }
});

// Helper methods
categorySchema.methods.updateProductsCount = async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({ category: this._id });
  this.productsCount = count;
  return this.save();
};

// Ensure child categories are updated if a parent category changes
categorySchema.post("save", async function () {
  if (this.isModified("name") || this.isModified("slug")) {
    try {
      // Find all categories that have this category in their ancestors
      const childCategories = await this.constructor.find({
        "ancestors._id": this._id,
      });

      // Update the ancestor data in each child
      for (const child of childCategories) {
        // Find and update the ancestor entry
        const ancestorIndex = child.ancestors.findIndex(
          (a) => a._id.toString() === this._id.toString()
        );

        if (ancestorIndex !== -1) {
          child.ancestors[ancestorIndex].name = this.name;
          child.ancestors[ancestorIndex].slug = this.slug;
          await child.save();
        }
      }
    } catch (error) {
      console.error("Error updating child categories:", error);
    }
  }
});

module.exports = mongoose.model("Category", categorySchema);
