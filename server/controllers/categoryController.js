const categoryService = require("../services/categoryService");
const { clearCache } = require("../middleware/cacheMiddleware");

/**
 * Category Controller - Handles HTTP requests and responses for categories
 */
class CategoryController {
  /**
   * Get all categories with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCategories(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: {
          isActive:
            req.query.isActive === "true"
              ? true
              : req.query.isActive === "false"
              ? false
              : undefined,
          parent: req.query.parent,
          search: req.query.search,
        },
      };

      const result = await categoryService.getAllCategories(options);
      res.json({
        success: true,
        data: result.categories,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get a category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryById(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.json({
        success: true,
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching category by ID:", error);

      if (
        error.message === "Invalid category ID format" ||
        error.message === "Category not found"
      ) {
        return res.status(404).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get a category by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryBySlug(req, res) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.json({
        success: true,
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching category by slug:", error);

      if (error.message === "Category not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get category children (subcategories)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategoryChildren(req, res) {
    try {
      const categories = await categoryService.getCategoryChildren(
        req.params.id
      );
      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching category children:", error);

      if (error.message === "Invalid category ID format") {
        return res.status(404).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Create a new category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);

      // Clear category cache
      clearCache("/api/v1/categories");

      res.status(201).json({
        success: true,
        data: category,
        message: "Category created successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update a category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCategory(req, res) {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );

      // Clear category cache
      clearCache("/api/v1/categories");

      res.json({
        success: true,
        data: category,
        message: "Category updated successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating category:", error);

      if (
        error.message === "Invalid category ID format" ||
        error.message === "Category not found"
      ) {
        return res.status(404).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete a category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);

      // Clear category cache
      clearCache("/api/v1/categories");

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error deleting category:", error);

      if (
        error.message === "Invalid category ID format" ||
        error.message === "Category not found"
      ) {
        return res.status(404).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      if (
        error.message === "Cannot delete category with subcategories" ||
        error.message === "Cannot delete category with associated products"
      ) {
        return res.status(400).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new CategoryController();
