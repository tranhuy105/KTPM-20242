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

// Helper function to update ancestors
async function updateAncestors(categoryId, parentId) {
  if (!parentId) {
    // If no parent, clear ancestors
    return [];
  }

  const parent = await mongoose.model("Category").findById(parentId);
  if (!parent) {
    throw new Error("Parent category not found");
  }

  // Set ancestors: parent's ancestors + parent itself
  return [
    ...(parent.ancestors || []),
    {
      _id: parent._id,
      name: parent.name,
      slug: parent.slug,
    },
  ];
}

// Update ancestors array when parent changes (for new documents)
categorySchema.pre("save", async function (next) {
  // Skip if parent hasn't changed
  if (!this.isModified("parent")) {
    return next();
  }

  try {
    // If parent is null, clear ancestors
    if (!this.parent) {
      this.ancestors = [];
      return next();
    }

    this.ancestors = await updateAncestors(this._id, this.parent);
    next();
  } catch (error) {
    next(error);
  }
});

// Update ancestors array when parent changes (for updates via findOneAndUpdate)
categorySchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const update = this.getUpdate();
  
  // Check if parent is being updated
  if (update.$set && update.$set.hasOwnProperty('parent')) {
    try {
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (!docToUpdate) {
        return next(new Error("Category not found"));
      }

      // Update ancestors based on new parent
      const newAncestors = await updateAncestors(docToUpdate._id, update.$set.parent);
      
      // Add ancestors to the update
      if (!update.$set) update.$set = {};
      update.$set.ancestors = newAncestors;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
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
      await updateChildrenAncestors(this);
    } catch (error) {
      console.error("Error updating child categories:", error);
    }
  }
});

// Also handle updates via findOneAndUpdate
categorySchema.post(['findOneAndUpdate', 'updateOne'], async function (doc) {
  if (doc && (this.getUpdate().$set?.name || this.getUpdate().$set?.slug)) {
    try {
      await updateChildrenAncestors(doc);
    } catch (error) {
      console.error("Error updating child categories:", error);
    }
  }
});

// Helper function to update children ancestors
async function updateChildrenAncestors(parentCategory) {
  // Find all categories that have this category in their ancestors
  const childCategories = await mongoose.model("Category").find({
    "ancestors._id": parentCategory._id,
  });

  // Update the ancestor data in each child
  for (const child of childCategories) {
    // Find and update the ancestor entry
    const ancestorIndex = child.ancestors.findIndex(
      (a) => a._id.toString() === parentCategory._id.toString()
    );

    if (ancestorIndex !== -1) {
      child.ancestors[ancestorIndex].name = parentCategory.name;
      child.ancestors[ancestorIndex].slug = parentCategory.slug;
      
      // Use updateOne to avoid triggering middleware loops
      await mongoose.model("Category").updateOne(
        { _id: child._id },
        { $set: { ancestors: child.ancestors } }
      );
    }
  }
}

module.exports = mongoose.model("Category", categorySchema);