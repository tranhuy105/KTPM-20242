const productService = require("../services/productService");

/**
 * Product Controller - Handles HTTP requests and responses for products
 */
class ProductController {
  /**
   * Get all products with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProducts(req, res) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        cursor: req.query.cursor,
        cursorDirection: req.query.cursorDirection,
        filters: {
          category: req.query.category,
          brand: req.query.brand,
          status: req.query.status,
          search: req.query.search,
          minPrice: req.query.minPrice,
          maxPrice: req.query.maxPrice,
          color: req.query.color,
          size: req.query.size,
          material: req.query.material,
          isFeatured:
            req.query.isFeatured === "true"
              ? true
              : req.query.isFeatured === "false"
              ? false
              : undefined,
          isPublished:
            req.query.isPublished === "true"
              ? true
              : req.query.isPublished === "false"
              ? false
              : undefined,
        },
      };

      const result = await productService.getAllProducts(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: error.message || "Server error" });
    }
  }

  /**
   * Get a product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by ID:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get a product by slug
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductBySlug(req, res) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Create a new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update a product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body
      );
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete a product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Add a product review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addProductReview(req, res) {
    try {
      const product = await productService.addProductReview(
        req.params.id,
        req.body
      );
      res.status(201).json({
        message: "Review added successfully",
        product: {
          _id: product._id,
          averageRating: product.averageRating,
          reviewCount: product.reviewCount,
        },
      });
    } catch (error) {
      console.error("Error adding product review:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(400).json({ error: error.message });
    }
  }
  /**
   * Get related products for a product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRelatedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const products = await productService.getRelatedProducts(
        req.params.id,
        limit
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching related products:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get featured products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeaturedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await productService.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get new arrivals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNewArrivals(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await productService.getNewArrivals(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get best sellers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBestSellers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await productService.getBestSellers(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Update product inventory
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProductInventory(req, res) {
    try {
      const product = await productService.updateProductInventory(
        req.params.id,
        req.body.quantity,
        req.body.variantId
      );
      res.json({
        message: "Inventory updated successfully",
        productId: product._id,
        inventoryQuantity: req.body.variantId
          ? product.variants.id(req.body.variantId).inventoryQuantity
          : product.inventoryQuantity,
      });
    } catch (error) {
      console.error("Error updating product inventory:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found" ||
        error.message === "Variant not found" ||
        error.message === "Variant ID required for variant products"
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Toggle product featured status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleProductFeatured(req, res) {
    try {
      if (req.body.isFeatured === undefined) {
        return res.status(400).json({
          error: "isFeatured field is required",
        });
      }

      const product = await productService.toggleProductFeatured(
        req.params.id,
        req.body.isFeatured
      );

      res.json({
        message: `Product ${
          req.body.isFeatured ? "marked as featured" : "removed from featured"
        }`,
        productId: product._id,
        isFeatured: product.isFeatured,
      });
    } catch (error) {
      console.error("Error toggling product featured status:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Toggle product published status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleProductPublished(req, res) {
    try {
      if (req.body.isPublished === undefined) {
        return res.status(400).json({
          error: "isPublished field is required",
        });
      }

      const product = await productService.toggleProductPublished(
        req.params.id,
        req.body.isPublished
      );

      res.json({
        message: `Product ${
          req.body.isPublished ? "published" : "unpublished"
        }`,
        productId: product._id,
        isPublished: product.isPublished,
      });
    } catch (error) {
      console.error("Error toggling product published status:", error);

      if (
        error.message === "Invalid product ID format" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * Get available filters for products
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableFilters(req, res) {
    try {
      const filters = await productService.getAvailableFilters();
      res.json(filters);
    } catch (error) {
      console.error("Error fetching available filters:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = new ProductController();
