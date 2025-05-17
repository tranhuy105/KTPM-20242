const { Product } = require("../models");
const mongoose = require("mongoose");

/**
 * Product Service - Contains all business logic for product operations
 */
class ProductService {
  /**
   * Get all products with pagination
   * @param {Object} options - Query options
   * @param {Number} options.page - Page number
   * @param {Number} options.limit - Items per page
   * @param {String} options.sortBy - Sort field
   * @param {String} options.sortOrder - Sort order (asc/desc)
   * @param {Object} options.filters - Filter criteria
   * @returns {Object} Products and pagination info
   */
  async getAllProducts(options = {}) {
    // Handle traditional offset-based pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort options
    const sortField = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Build filter query
    const filter = {};
    if (options.filters) {
      // Category filter - only apply if not empty string
      if (options.filters.category && options.filters.category.trim() !== "") {
        filter.category = options.filters.category;
      }

      // Brand filter - only apply if not empty string
      if (options.filters.brand && options.filters.brand.trim() !== "") {
        filter.brand = options.filters.brand;
      }

      // Status filter
      if (options.filters.status) {
        filter.status = options.filters.status;
      }

      // Featured filter
      if (options.filters.isFeatured !== undefined) {
        filter.isFeatured = options.filters.isFeatured;
      }

      // Published filter
      if (options.filters.isPublished !== undefined) {
        filter.isPublished = options.filters.isPublished;
      }

      // Price range filter
      if (
        options.filters.minPrice !== undefined ||
        options.filters.maxPrice !== undefined
      ) {
        filter.price = {};
        if (options.filters.minPrice !== undefined) {
          filter.price.$gte = parseFloat(options.filters.minPrice);
        }
        if (options.filters.maxPrice !== undefined) {
          filter.price.$lte = parseFloat(options.filters.maxPrice);
        }
      }

      // Rating filter
      if (options.filters.minRating !== undefined) {
        filter.averageRating = { $gte: parseFloat(options.filters.minRating) };
      }

      // Initialize $and array for multiple filter conditions that should be combined with AND
      filter.$and = filter.$and || [];

      // Color filter - check both main product and variants
      if (options.filters.color && options.filters.color.trim() !== "") {
        const colorValue = options.filters.color.trim();
        filter.$and.push({
          $or: [
            { color: colorValue },
            { "variants.attributes.color": colorValue },
          ],
        });
      }

      // Size filter - check both main product and variants
      if (options.filters.size && options.filters.size.trim() !== "") {
        const sizeValue = options.filters.size.trim();
        filter.$and.push({
          $or: [{ size: sizeValue }, { "variants.attributes.size": sizeValue }],
        });
      }

      // Material filter - check both main product and variants
      if (options.filters.material && options.filters.material.trim() !== "") {
        const materialValue = options.filters.material.trim();
        filter.$and.push({
          $or: [
            { material: materialValue },
            { "variants.attributes.material": materialValue },
          ],
        });
      }

      // Attributes filter (dynamic attributes)
      if (
        options.filters.attributes &&
        typeof options.filters.attributes === "object"
      ) {
        for (const [key, value] of Object.entries(options.filters.attributes)) {
          if (value && value.trim() !== "") {
            // Check both main product attributes and variant attributes
            filter.$and.push({
              $or: [
                { [`attributes.${key}`]: value },
                { [`variants.attributes.${key}`]: value },
              ],
            });
          }
        }
      }

      // Text search - only apply if not empty string
      if (options.filters.search && options.filters.search.trim() !== "") {
        try {
          // Check if text index exists
          const indexes = await Product.collection.getIndexes();
          const hasTextIndex = Object.values(indexes).some((index) =>
            index.hasOwnProperty("textIndexVersion")
          );

          if (hasTextIndex) {
            // Use text index if available
            filter.$text = { $search: options.filters.search };
          } else {
            // Fallback to regex search if no text index
            filter.$and.push({
              $or: [
                { name: { $regex: options.filters.search, $options: "i" } },
                {
                  description: {
                    $regex: options.filters.search,
                    $options: "i",
                  },
                },
                {
                  brandName: { $regex: options.filters.search, $options: "i" },
                },
              ],
            });
          }
        } catch (error) {
          // Fallback to regex search if error checking indexes
          filter.$and.push({
            $or: [
              { name: { $regex: options.filters.search, $options: "i" } },
              {
                description: { $regex: options.filters.search, $options: "i" },
              },
              { brandName: { $regex: options.filters.search, $options: "i" } },
            ],
          });
        }
      }

      // Remove empty $and array if no conditions were added
      if (filter.$and.length === 0) {
        delete filter.$and;
      }
    }

    // Add cursor-based pagination support
    if (options.cursor) {
      // If cursor is provided, use cursor-based pagination
      const cursorQuery = {};

      // Direction for cursor (default to 'next' which means get items after the cursor)
      const direction = options.cursorDirection || "next";

      // Add cursor constraint based on sort direction and cursor direction
      if (
        (sortOrder === 1 && direction === "next") ||
        (sortOrder === -1 && direction === "prev")
      ) {
        // For ascending order & next page OR descending order & prev page
        cursorQuery[sortField] = { $gt: options.cursor };
      } else {
        // For descending order & next page OR ascending order & prev page
        cursorQuery[sortField] = { $lt: options.cursor };
      }

      // Add the cursor constraint to the filter
      filter.$and = filter.$and || [];
      filter.$and.push(cursorQuery);
    }

    // Execute query with pagination
    try {
      // For cursor-based pagination, we don't use skip
      // Instead we filter by the cursor value
      const query = Product.find(filter)
        .select(this.getProductListFields())
        .sort(sort)
        .limit(limit);

      // Only apply skip for offset-based pagination when cursor is not provided
      if (!options.cursor) {
        query.skip(skip);
      }

      const products = await query.populate([
        {
          path: "category",
          select: "name slug",
        },
        {
          path: "brand",
          select: "name slug logo",
        },
      ]);

      const totalCount = await Product.countDocuments(filter);

      // Get cursor values
      let nextCursor = null;
      let prevCursor = null;

      if (products.length > 0) {
        // Next cursor is the value of the last item
        nextCursor = products[products.length - 1][sortField];

        // Previous cursor is the value of the first item
        prevCursor = products[0][sortField];
      }

      return {
        products,
        pagination: {
          totalCount,
          currentPage: options.cursor ? undefined : page,
          totalPages: options.cursor
            ? undefined
            : Math.ceil(totalCount / limit),
          hasNextPage: products.length === limit,
          hasPrevPage: options.cursor ? true : page > 1,
          nextCursor,
          prevCursor,
          limit,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  /**
   * Get available filters for products
   * @returns {Object} Available filters
   */
  async getAvailableFilters() {
    try {
      return await Product.getAvailableFilters();
    } catch (error) {
      throw new Error(`Error getting available filters: ${error.message}`);
    }
  }

  /**
   * Get a product by ID
   * @param {String} id - Product ID
   * @returns {Object} Product object
   */
  async getProductById(id) {
    try {
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID format");
      }

      const product = await Product.findById(id)
        .populate({
          path: "category",
          select: "name slug ancestors",
        })
        .populate({
          path: "reviews.user",
          select: "username firstName lastName avatar",
        });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a product by slug
   * @param {String} slug - Product slug
   * @returns {Object} Product object
   */
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug })
        .populate({
          path: "category",
          select: "name slug ancestors",
        })
        .populate({
          path: "reviews.user",
          select: "username firstName lastName avatar",
        });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Object} Created product
   */
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return product;
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  /**
   * Update a product
   * @param {String} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Object} Updated product
   */
  async updateProduct(id, productData) {
    try {
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID format");
      }

      const product = await Product.findByIdAndUpdate(id, productData, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {String} id - Product ID
   * @returns {Object} Deleted product
   */
  async deleteProduct(id) {
    try {
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID format");
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a product review
   * @param {String} productId - Product ID
   * @param {Object} reviewData - Review data
   * @returns {Object} Updated product
   */
  async addProductReview(productId, reviewData) {
    try {
      const product = await this.getProductById(productId);

      // Add the review
      product.reviews.push(reviewData);

      // Save the product
      await product.save();

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product inventory
   * @param {String} productId - Product ID
   * @param {Number} quantity - New inventory quantity
   * @param {String} variantId - Variant ID (optional, for variant products)
   * @returns {Object} Updated product
   */
  async updateProductInventory(productId, quantity, variantId = null) {
    try {
      const product = await this.getProductById(productId);

      if (product.hasVariants && !variantId) {
        throw new Error("Variant ID required for variant products");
      }

      if (product.hasVariants && variantId) {
        // Find the variant
        const variant = product.variants.id(variantId);
        if (!variant) {
          throw new Error("Variant not found");
        }
        variant.inventoryQuantity = Math.max(0, quantity);
      } else {
        // Update main product inventory
        product.inventoryQuantity = Math.max(0, quantity);
      }

      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle product publication status
   * @param {String} productId - Product ID
   * @param {Boolean} isPublished - Publication status
   * @returns {Object} Updated product
   */
  async toggleProductPublished(productId, isPublished) {
    try {
      const product = await this.getProductById(productId);
      product.isPublished = isPublished;
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle product featured status
   * @param {String} productId - Product ID
   * @param {Boolean} isFeatured - Featured status
   * @returns {Object} Updated product
   */
  async toggleProductFeatured(productId, isFeatured) {
    try {
      const product = await this.getProductById(productId);
      product.isFeatured = isFeatured;
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get related products (products in the same category)
   * @param {String} productId - Product ID
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} Related products
   */
  async getRelatedProducts(productId, limit = 4) {
    try {
      const product = await this.getProductById(productId);

      // Get products from the same category
      const relatedProducts = await Product.find(
        {
          category: product.category,
          _id: { $ne: product._id }, // Exclude the current product
          status: "active",
          isPublished: true,
        },
        this.getProductListFields()
      )
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: "category",
          select: "name slug",
        });

      return relatedProducts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get featured products
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} Featured products
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await Product.find(
        {
          isFeatured: true,
          status: "active",
          isPublished: true,
        },
        this.getProductListFields()
      )
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: "category",
          select: "name slug",
        });

      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get new arrivals (most recently added products)
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} New products
   */
  async getNewArrivals(limit = 8) {
    try {
      const products = await Product.find(
        {
          status: "active",
          isPublished: true,
        },
        this.getProductListFields()
      )
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate({
          path: "category",
          select: "name slug",
        });

      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get best selling products based on rating
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} Best-selling products
   */
  async getBestSellers(limit = 8) {
    try {
      const products = await Product.find(
        {
          status: "active",
          isPublished: true,
          reviewCount: { $gt: 0 },
        },
        this.getProductListFields()
      )
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(limit)
        .populate({
          path: "category",
          select: "name slug",
        });

      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper to get common product list fields
   * @returns {Object} Field projection object
   */
  getProductListFields() {
    return {
      _id: 1,
      name: 1,
      slug: 1,
      price: 1,
      compareAtPrice: 1,
      images: 1,
      inventoryQuantity: 1,
      hasVariants: 1,
      status: 1,
      category: 1,
      brand: 1,
      brandName: 1,
      color: 1,
      size: 1,
      material: 1,
      createdAt: 1,
      averageRating: 1,
      reviewCount: 1,
    };
  }
}

module.exports = new ProductService();
