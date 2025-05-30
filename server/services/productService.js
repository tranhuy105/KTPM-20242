const { Product, User } = require("../models");
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
   * @param {Boolean} options.isAdmin - Whether this is an admin request
   * @returns {Object} Products and pagination info
   */
  async getAllProducts(options = {}) {
    try {
      // Build base filter
      const filter = await this.buildProductFilter(options.filters);

      // Setup pagination
      const { query, pagination } = this.setupPagination(filter, options);

      // Execute query
      const products = await query.populate([
        { path: "category", select: "name slug" },
        { path: "brand", select: "name slug logo" },
      ]);

      // Get cursor values if using cursor-based pagination
      const paginationInfo = await this.finalizePagination(
        products,
        filter,
        pagination,
        options
      );

      return { products, pagination: paginationInfo };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  /**
   * Build the filter object for product queries
   * @param {Object} filters - Filter criteria
   * @returns {Object} MongoDB filter object
   */
  async buildProductFilter(filters = {}) {
    const filter = {};
    if (!filters) return filter;

    // Initialize $and array for combining multiple conditions
    filter.$and = [];

    // Apply basic filters
    await this.applyBasicFilters(filter, filters);

    // Apply attribute filters
    this.applyAttributeFilters(filter, filters);

    // Apply text search
    await this.applyTextSearch(filter, filters);

    // Clean up empty $and array if no conditions were added
    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    return filter;
  }

  /**
   * Apply basic filters like category, brand, status, price range, etc.
   * @param {Object} filter - Filter object to modify
   * @param {Object} filters - User provided filters
   */
  async applyBasicFilters(filter, filters) {
    // Category filter
    if (filters.category && filters.category.trim() !== "") {
      const categoryId = filters.category.trim();
      const categoryIds = await this.getCategoryWithChildren(categoryId);
      
      // Get active categories only
      const Category = mongoose.model("Category");
      const activeCategories = await Category.find({
        _id: { $in: categoryIds },
        isActive: true
      }).select("_id");
      
      const activeCategoryIds = activeCategories.map(cat => cat._id);
      filter.category = { $in: activeCategoryIds };
    }

    // Brand filter
    if (filters.brand && filters.brand.trim() !== "") {
      const brandId = filters.brand.trim();
      
      // Check if brand is active
      const Brand = mongoose.model("Brand");
      const brand = await Brand.findOne({ 
        _id: brandId,
        isActive: true 
      });
      
      if (brand) {
        filter.brand = brandId;
      }
    }

    // Featured filter
    if (filters.isFeatured !== undefined) {
      filter.isFeatured = filters.isFeatured;
    }

    // Published filter
    if (filters.isPublished !== undefined) {
      filter.isPublished = filters.isPublished;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.price = {};
      if (filters.minPrice !== undefined) {
        filter.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        filter.price.$lte = parseFloat(filters.maxPrice);
      }
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      filter.averageRating = { $gte: parseFloat(filters.minRating) };
    }
  }

  /**
   * Apply attribute filters like color, size, material, etc.
   * @param {Object} filter - Filter object to modify
   * @param {Object} filters - User provided filters
   */
  applyAttributeFilters(filter, filters) {
    // Color filter
    if (filters.color && filters.color.trim() !== "") {
      filter.color = filters.color.trim();
    }

    // Size filter
    if (filters.size && filters.size.trim() !== "") {
      filter.size = filters.size.trim();
    }

    // Material filter
    if (filters.material && filters.material.trim() !== "") {
      filter.material = filters.material.trim();
    }

    // Dynamic attributes filter
    if (filters.attributes && typeof filters.attributes === "object") {
      for (const [key, value] of Object.entries(filters.attributes)) {
        if (value && value.trim() !== "") {
          filter[`attributes.${key}`] = value;
        }
      }
    }
  }

  /**
   * Apply text search to the filter
   * @param {Object} filter - Filter object to modify
   * @param {Object} filters - User provided filters
   */
  async applyTextSearch(filter, filters) {
    if (!filters.search || filters.search.trim() === "") return;

    try {
      // Check if text index exists
      const indexes = await Product.collection.getIndexes();
      const hasTextIndex = Object.values(indexes).some((index) =>
        index.hasOwnProperty("textIndexVersion")
      );

      if (hasTextIndex) {
        // Use text index if available
        filter.$text = { $search: filters.search };
      } else {
        // Fallback to regex search
        this.applyRegexSearch(filter, filters.search);
      }
    } catch (error) {
      // Fallback to regex search if error checking indexes
      this.applyRegexSearch(filter, filters.search);
    }
  }

  /**
   * Apply regex search for text when text index is unavailable
   * @param {Object} filter - Filter object to modify
   * @param {String} searchText - Text to search for
   */
  applyRegexSearch(filter, searchText) {
    filter.$and.push({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { brandName: { $regex: searchText, $options: "i" } },
      ],
    });
  }

  /**
   * Setup pagination for product queries
   * @param {Object} filter - Base filter object
   * @param {Object} options - Pagination options
   * @returns {Object} Query and pagination objects
   */
  setupPagination(filter, options) {
    // Handle traditional offset-based pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort options
    const sortField = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Create base query
    const query = Product.find(filter)
      .select(
        options.isAdmin
          ? this.getAdminProductListFields()
          : this.getProductListFields()
      )
      .sort(sort)
      .limit(limit);

    // Apply cursor-based pagination if requested
    if (options.cursor) {
      this.applyCursorPagination(filter, options, sortField, sortOrder);
    } else {
      // Only apply skip for offset-based pagination
      query.skip(skip);
    }

    return {
      query,
      pagination: {
        limit,
        currentPage: options.cursor ? undefined : page,
      },
    };
  }

  /**
   * Apply cursor-based pagination to the filter
   * @param {Object} filter - Filter object to modify
   * @param {Object} options - Pagination options
   * @param {String} sortField - Field to sort by
   * @param {Number} sortOrder - Sort order (1 for asc, -1 for desc)
   */
  applyCursorPagination(filter, options, sortField, sortOrder) {
    const cursorQuery = {};
    const direction = options.cursorDirection || "next";

    // Add cursor constraint based on sort and cursor direction
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

  /**
   * Finalize pagination info after query execution
   * @param {Array} products - Retrieved products
   * @param {Object} filter - Filter used in the query
   * @param {Object} pagination - Base pagination info
   * @param {Object} options - Original pagination options
   * @returns {Object} Complete pagination info
   */
  async finalizePagination(products, filter, pagination, options) {
    const totalCount = await Product.countDocuments(filter);
    const sortField = options.sortBy || "createdAt";
    const { limit } = pagination;

    // Get cursor values if results exist
    let nextCursor = null;
    let prevCursor = null;

    if (products.length > 0) {
      // Next cursor is the value of the last item
      nextCursor = products[products.length - 1][sortField];
      // Previous cursor is the value of the first item
      prevCursor = products[0][sortField];
    }

    return {
      ...pagination,
      totalCount,
      totalPages: options.cursor ? undefined : Math.ceil(totalCount / limit),
      hasNextPage: products.length === limit,
      hasPrevPage: options.cursor ? true : pagination.currentPage > 1,
      nextCursor,
      prevCursor,
    };
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
      this.validateObjectId(id);

      const product = await this.findActiveProduct({ _id: id });

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
      const product = await this.findActiveProduct({ slug });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find an active product by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Object} Product object
   */
  async findActiveProduct(criteria) {
    return Product.findOne(criteria)
      .and([{ isPublished: true }])
      .populate({
        path: "category",
        select: "name slug ancestors",
      })
      .populate({
        path: "brand",
        select: "_id name slug logo website description isActive",
        match: { isActive: true }
      })
      .populate({
        path: "reviews.user",
        select: "username firstName lastName avatar",
      });
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
      this.validateObjectId(id);

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
      this.validateObjectId(id);

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
      // Verify that the product exists
      const product = await this.getProductById(productId);

      // Verify if user has purchased this product with a delivered order
      const userId = reviewData.user;

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Check if user has already reviewed this product
      const hasExistingReview = product.reviews.some(
        (review) => review.user && review.user.toString() === userId
      );

      if (hasExistingReview) {
        throw new Error("You have already reviewed this product");
      }

      // Find all delivered orders for this user that contain this product
      const Order = mongoose.model("Order");
      const deliveredOrders = await Order.find({
        user: userId,
        status: "delivered",
        "products.product": productId,
      }).lean();

      // If no delivered orders found, user can't review
      if (deliveredOrders.length === 0) {
        throw new Error(
          "You can only review products you have purchased and received"
        );
      }

      // Set verified purchase flag
      reviewData.isVerifiedPurchase = true;

      // Add the review to the product
      product.reviews.push(reviewData);

      // Update average rating
      await product.updateAverageRating();

      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product inventory
   * @param {String} productId - Product ID
   * @param {Number} quantity - New inventory quantity
   * @returns {Object} Updated product
   */
  async updateProductInventory(productId, quantity) {
    try {
      const product = await this.getProductById(productId);
      product.inventoryQuantity = Math.max(0, quantity);
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle product status
   * @param {String} productId - Product ID
   * @param {String} field - Field to toggle (isPublished or isFeatured)
   * @param {Boolean} value - New value
   * @returns {Object} Updated product
   */
  async toggleProductStatus(productId, field, value) {
    try {
      this.validateObjectId(productId);

      const updateData = { [field]: value };
      const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
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
   * Toggle product publication status
   * @param {String} productId - Product ID
   * @param {Boolean} isPublished - Publication status
   * @returns {Object} Updated product
   */
  async toggleProductPublished(productId, isPublished) {
    return this.toggleProductStatus(productId, "isPublished", isPublished);
  }

  /**
   * Toggle product featured status
   * @param {String} productId - Product ID
   * @param {Boolean} isFeatured - Featured status
   * @returns {Object} Updated product
   */
  async toggleProductFeatured(productId, isFeatured) {
    return this.toggleProductStatus(productId, "isFeatured", isFeatured);
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

      // Get the category and all its siblings/children
      const categoryIds = await this.getRelatedCategories(product);

      // Get products from the same category and related categories
      return this.findProductsByCategories(categoryIds, product._id, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get related categories for a product
   * @param {Object} product - Product object
   * @returns {Array} Related category IDs
   */
  async getRelatedCategories(product) {
    let categoryIds = [product.category];

    // If the product's category has a parent, include sibling categories
    if (product.category && product.category.parent) {
      // Get all categories with the same parent
      const Category = mongoose.model("Category");
      const siblingCategories = await Category.find({
        parent: product.category.parent,
      }).select("_id");

      if (siblingCategories && siblingCategories.length > 0) {
        categoryIds = siblingCategories.map((c) => c._id);
      }
    } else {
      // If it's a parent category, include its children
      categoryIds = await this.getCategoryWithChildren(product.category);
    }

    return categoryIds;
  }

  /**
   * Find products by category IDs
   * @param {Array} categoryIds - Category IDs
   * @param {String} excludeProductId - Product ID to exclude
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} Products
   */
  async findProductsByCategories(categoryIds, excludeProductId, limit) {
    return Product.find(
      {
        category: { $in: categoryIds },
        _id: { $ne: excludeProductId }, // Exclude the current product
        isPublished: true,
      },
      this.getProductListFields()
    )
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        select: "name slug",
      })
      .populate({
        path: "brand",
        select: "name slug logo",
        match: { isActive: true }
      });
  }

  /**
   * Get products by filter criteria
   * @param {Object} filterCriteria - Filter criteria
   * @param {Number} limit - Maximum number of products to return
   * @param {Object} sort - Sort criteria
   * @returns {Array} Products matching criteria
   */
  async getProductsByFilter(
    filterCriteria,
    limit = 8,
    sort = { createdAt: -1 }
  ) {
    try {
      return Product.find(
        {
          ...filterCriteria,
          isPublished: true,
        },
        this.getProductListFields()
      )
        .sort(sort)
        .limit(limit)
        .populate({
          path: "category",
          select: "name slug",
        })
        .populate({
          path: "brand",
          select: "name slug logo",
          match: { isActive: true }
        });
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
    return this.getProductsByFilter({ isFeatured: true }, limit);
  }

  /**
   * Get new arrivals (most recently added products)
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} New products
   */
  async getNewArrivals(limit = 8) {
    return this.getProductsByFilter({}, limit, { createdAt: -1 });
  }

  /**
   * Get best selling products based on rating
   * @param {Number} limit - Maximum number of products to return
   * @returns {Array} Best-selling products
   */
  async getBestSellers(limit = 8) {
    return this.getProductsByFilter({ reviewCount: { $gt: 0 } }, limit, {
      averageRating: -1,
      reviewCount: -1,
    });
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

  /**
   * Helper to get admin product list fields (includes additional fields for admin)
   * @returns {Object} Field projection object
   */
  getAdminProductListFields() {
    return {
      ...this.getProductListFields(),
      isPublished: 1,
      isFeatured: 1,
      updatedAt: 1,
      shortDescription: 1,
    };
  }

  /**
   * Helper to get a category and all its child category IDs
   * @param {String} categoryId - Parent category ID
   * @returns {Array} Array of category IDs including parent and all children
   */
  async getCategoryWithChildren(categoryId) {
    try {
      // First check if we have a valid category ID
      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return [];
      }

      // Get all descendants recursively
      const allCategoryIds = await this.getAllCategoryDescendants(categoryId);

      // Include the parent category ID
      return [categoryId, ...allCategoryIds];
    } catch (err) {
      console.error("Error fetching child categories:", err);
      return [categoryId];
    }
  }

  /**
   * Helper to recursively get all descendant category IDs
   * @param {String} categoryId - Parent category ID
   * @returns {Array} Array of all descendant category IDs
   */
  async getAllCategoryDescendants(categoryId) {
    try {
      const Category = mongoose.model("Category");
      const childCategories = await Category.find({
        parent: categoryId,
        isActive: true
      }).select("_id");

      if (!childCategories || childCategories.length === 0) {
        return [];
      }

      const childIds = childCategories.map((c) => c._id);

      // For each child, recursively get its children
      const descendantPromises = childIds.map((id) =>
        this.getAllCategoryDescendants(id)
      );
      const nestedDescendants = await Promise.all(descendantPromises);

      // Flatten the nested arrays of descendants
      const allDescendants = nestedDescendants.reduce(
        (acc, descendants) => [...acc, ...descendants],
        []
      );

      // Return all child IDs and their descendants
      return [...childIds, ...allDescendants];
    } catch (err) {
      console.error("Error fetching category descendants:", err);
      return [];
    }
  }

  /**
   * Utility to validate MongoDB ObjectId
   * @param {String} id - ID to validate
   * @throws {Error} If ID is invalid
   */
  validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }
  }

  /**
   * Get a product by ID for admin (no active/published restrictions)
   * @param {String} id - Product ID
   * @returns {Object} Product object
   */
  async getProductByIdAdmin(id) {
    try {
      this.validateObjectId(id);

      const product = await Product.findById(id)
        .populate({
          path: "category",
          select: "name slug ancestors",
        })
        .populate({
          path: "brand",
          select: "_id name slug logo website description isActive",
          match: { isActive: true }
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
   * Get a product by slug for admin (no active/published restrictions)
   * @param {String} slug - Product slug
   * @returns {Object} Product object
   */
  async getProductBySlugAdmin(slug) {
    try {
      const product = await Product.findOne({ slug })
        .populate({
          path: "category",
          select: "name slug ancestors",
        })
        .populate({
          path: "brand",
          select: "_id name slug logo website description isActive",
          match: { isActive: true },
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
   * Toggle a product in user's wishlist
   * @param {string} productId - Product ID to toggle
   * @param {Object} user - User object
   * @returns {Object} Updated wishlist
   */
  async toggleProductInWishlist(productId, user) {
    try {
      // Check if product exists
      await this.getProductById(productId);

      // Check if product is already in wishlist
      const isCurrentlyInWishlist = user.wishlist.some(
        (item) => item.product && item.product.toString() === productId
      );

      // Update the user's wishlist
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        user.wishlist = user.wishlist.filter(
          (item) => !item.product || item.product.toString() !== productId
        );

        await User.findByIdAndUpdate(user._id, {
          wishlist: user.wishlist,
        });

        return {
          success: true,
          message: "Product removed from wishlist",
          wishlist: user.wishlist,
        };
      } else {
        // Add to wishlist
        const newWishlistItem = {
          product: productId,
          addedAt: new Date(),
        };

        user.wishlist.push(newWishlistItem);

        await User.findByIdAndUpdate(user._id, {
          wishlist: user.wishlist,
        });

        return {
          success: true,
          message: "Product added to wishlist",
          wishlist: user.wishlist,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products in user's wishlist
   * @param {string} userId - User ID
   * @returns {Array} Array of products in wishlist
   */
  async getWishlistProducts(userId) {
    try {
      // Get the user with populated wishlist
      const user = await User.findById(userId)
        .select("wishlist")
        .populate({
          path: "wishlist.product",
          select:
            "_id name slug price compareAtPrice images category brand description status",
          match: { isPublished: true },
        })
        .lean();

      if (!user) {
        throw new Error("User not found");
      }

      // Filter out any null products (in case some products were deleted or unpublished)
      const wishlistProducts = user.wishlist
        .filter((item) => item.product)
        .map((item) => {
          // Enhance the product with the date it was added to wishlist
          return {
            ...item.product,
            addedToWishlistAt: item.addedAt,
          };
        });

      return wishlistProducts;
    } catch (error) {
      console.error("Error in getWishlistProducts:", error);
      throw error;
    }
  }
}

module.exports = new ProductService();
