const { Category, Product } = require("../models");
const mongoose = require("mongoose");
const {
  getPaginationParams,
  buildPaginationResult,
} = require("../utils/paginationUtils");

/**
 * Category Service - Business logic for category operations
 */
class CategoryService {
  /**
   * Get all categories with optional filtering
   * @param {Object} options - Query options (pagination, filters)
   * @returns {Promise<Object>} - Categories and pagination data
   */
  async getAllCategories(options = {}) {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams({
      page: options.page,
      limit: options.limit,
    });

    // Build filter object
    const filter = {};

    if (options.filters) {
      if (options.filters.isActive !== undefined) {
        filter.isActive = options.filters.isActive;
      }

      if (options.filters.parent) {
        filter.parent =
          options.filters.parent === "null" ? null : options.filters.parent;
      }

      if (options.filters.search) {
        filter.$or = [
          { name: { $regex: options.filters.search, $options: "i" } },
          { slug: { $regex: options.filters.search, $options: "i" } },
          { description: { $regex: options.filters.search, $options: "i" } },
        ];
      }
    }

    // Build sort object
    const sortField = options.sortBy || "name";
    const sortOrder = options.sortOrder === "desc" ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    // Execute query with pagination
    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "parent",
        select: "name slug",
      });

    // Get total count for pagination
    const totalCount = await Category.countDocuments(filter);

    // Build pagination result with HATEOAS links
    const pagination = buildPaginationResult(
      totalCount,
      page,
      limit,
      "/api/v1/categories"
    );

    return {
      categories,
      pagination,
    };
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} - Category object
   */
  async getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID format");
    }

    const category = await Category.findById(id).populate({
      path: "parent",
      select: "name slug",
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} - Category object
   */
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug }).populate({
      path: "parent",
      select: "name slug",
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  /**
   * Get category children (subcategories)
   * @param {string} id - Parent category ID
   * @returns {Promise<Array>} - Array of child categories
   */
  async getCategoryChildren(id) {
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID format");
    }

    const filter = id ? { parent: id } : { parent: null };

    const categories = await Category.find(filter).sort({
      displayOrder: 1,
      name: 1,
    });

    return categories;
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Created category
   */
  async createCategory(categoryData) {
    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = this.generateSlug(categoryData.name);
    }

    // Check if slug exists
    const existingCategory = await Category.findOne({
      slug: categoryData.slug,
    });
    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }

    // Handle parent relationship
    if (categoryData.parent) {
      if (!mongoose.Types.ObjectId.isValid(categoryData.parent)) {
        throw new Error("Invalid parent category ID");
      }

      const parent = await Category.findById(categoryData.parent);
      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    // Create and return the new category
    const category = new Category(categoryData);
    await category.save();

    return category;
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} - Updated category
   */
  async updateCategory(id, categoryData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID format");
    }

    // Find the category to update
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Validate parent relationship to prevent circular references
    if (categoryData.parent) {
      if (categoryData.parent.toString() === id) {
        throw new Error("Category cannot be its own parent");
      }

      // Check if parent exists
      if (!mongoose.Types.ObjectId.isValid(categoryData.parent)) {
        throw new Error("Invalid parent category ID");
      }

      const parent = await Category.findById(categoryData.parent);
      if (!parent) {
        throw new Error("Parent category not found");
      }

      // Check for circular references in ancestors
      if (
        parent.ancestors &&
        parent.ancestors.some((a) => a._id.toString() === id)
      ) {
        throw new Error("Circular reference detected in category hierarchy");
      }
    }

    // Update slug if name has changed and slug hasn't been explicitly set
    if (
      categoryData.name &&
      !categoryData.slug &&
      category.name !== categoryData.name
    ) {
      categoryData.slug = this.generateSlug(categoryData.name);
    }

    // Check if new slug exists (if changed)
    if (categoryData.slug && categoryData.slug !== category.slug) {
      const existingCategory = await Category.findOne({
        slug: categoryData.slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new Error("Category with this slug already exists");
      }
    }

    // Update and return the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: categoryData },
      { new: true, runValidators: true }
    ).populate({
      path: "parent",
      select: "name slug",
    });

    return updatedCategory;
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID format");
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      throw new Error("Cannot delete category with associated products");
    }

    // Delete the category
    await Category.findByIdAndDelete(id);
  }

  /**
   * Helper method to generate slug from name
   * @param {string} name - Category name
   * @returns {string} - Generated slug
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}

module.exports = new CategoryService();
