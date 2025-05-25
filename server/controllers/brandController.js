const brandService = require("../services/brandService");

/**
 * Brand Controller - Handles HTTP requests and responses for brands
 */
class BrandController {
  /**
   * Get all brands with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllBrands(req, res) {
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
          search: req.query.search,
        },
      };

      const result = await brandService.getAllBrands(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  }

  /**
   * Get a brand by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBrandById(req, res) {
    try {
      const brand = await brandService.getBrandById(req.params.id);
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand by ID:", error);

      if (
        error.message === "Invalid brand ID format" ||
        error.message === "Brand not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get a brand by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBrandBySlug(req, res) {
    try {
      const brand = await brandService.getBrandBySlug(req.params.slug);
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand by slug:", error);

      if (error.message === "Brand not found") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Create a new brand
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBrand(req, res) {
    try {
      const brand = await brandService.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update a brand
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBrand(req, res) {
    try {
      const brand = await brandService.updateBrand(req.params.id, req.body);
      res.json(brand);
    } catch (error) {
      console.error("Error updating brand:", error);

      if (
        error.message === "Invalid brand ID format" ||
        error.message === "Brand not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete a brand - DEPRECATED
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBrand(req, res) {
    // For data integrity reasons, deletion is no longer supported
    // This method is kept for backward compatibility but will return an error
    return res.status(405).json({
      error:
        "Deletion of brands is not supported. Use the update endpoint to set isActive: false instead.",
      message: "For data integrity, brands can be disabled but not deleted.",
    });
  }

  /**
   * Get brands with product counts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBrandsWithProductCounts(req, res) {
    try {
      const brands = await brandService.getBrandsWithProductCounts();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands with product counts:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = new BrandController();
