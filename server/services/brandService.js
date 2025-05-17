const { Brand, Product } = require("../models");
const mongoose = require("mongoose");

/**
 * Brand Service - Business logic for brand operations
 */
class BrandService {
  /**
   * Get all brands with optional filtering
   * @param {Object} options - Query options (pagination, filters)
   * @returns {Promise<Object>} - Brands and pagination data
   */
  async getAllBrands(options = {}) {
    // Handle pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (options.filters) {
      if (options.filters.isActive !== undefined) {
        filter.isActive = options.filters.isActive;
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
    const brands = await Brand.find(filter).sort(sort).skip(skip).limit(limit);

    // Get total count for pagination
    const totalCount = await Brand.countDocuments(filter);

    return {
      brands,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
        limit,
      },
    };
  }

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<Object>} - Brand object
   */
  async getBrandById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid brand ID format");
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  /**
   * Get brand by slug
   * @param {string} slug - Brand slug
   * @returns {Promise<Object>} - Brand object
   */
  async getBrandBySlug(slug) {
    const brand = await Brand.findOne({ slug });

    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  /**
   * Create a new brand
   * @param {Object} brandData - Brand data
   * @returns {Promise<Object>} - Created brand
   */
  async createBrand(brandData) {
    // Generate slug if not provided
    if (!brandData.slug && brandData.name) {
      brandData.slug = Brand.generateSlug(brandData.name);
    }

    // Check if slug exists
    const existingBrand = await Brand.findOne({ slug: brandData.slug });
    if (existingBrand) {
      throw new Error("Brand with this slug already exists");
    }

    // Create and return the new brand
    const brand = new Brand(brandData);
    await brand.save();

    return brand;
  }

  /**
   * Update a brand
   * @param {string} id - Brand ID
   * @param {Object} brandData - Updated brand data
   * @returns {Promise<Object>} - Updated brand
   */
  async updateBrand(id, brandData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid brand ID format");
    }

    // Find the brand to update
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Update slug if name has changed and slug hasn't been explicitly set
    if (brandData.name && !brandData.slug && brand.name !== brandData.name) {
      brandData.slug = Brand.generateSlug(brandData.name);
    }

    // Check if new slug exists (if changed)
    if (brandData.slug && brandData.slug !== brand.slug) {
      const existingBrand = await Brand.findOne({
        slug: brandData.slug,
        _id: { $ne: id },
      });

      if (existingBrand) {
        throw new Error("Brand with this slug already exists");
      }
    }

    // Update and return the brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { $set: brandData },
      { new: true, runValidators: true }
    );

    return updatedBrand;
  }

  /**
   * Delete a brand
   * @param {string} id - Brand ID
   * @returns {Promise<void>}
   */
  async deleteBrand(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid brand ID format");
    }

    // Check if brand exists
    const brand = await Brand.findById(id);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Check if brand has products
    const productsCount = await Product.countDocuments({ brand: id });
    if (productsCount > 0) {
      throw new Error("Cannot delete brand with associated products");
    }

    // Delete the brand
    await Brand.findByIdAndDelete(id);
  }

  /**
   * Get brands with product counts
   * @returns {Promise<Array>} - Array of brands with product counts
   */
  async getBrandsWithProductCounts() {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });

    // Update product counts
    for (const brand of brands) {
      await brand.updateProductsCount();
    }

    return brands;
  }
}

module.exports = new BrandService();
