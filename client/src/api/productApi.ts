import axiosInstance from "./axiosInstance";
import type {
  Product,
  ProductFilters,
  ApiResponse,
  ProductListResponse,
  AvailableProductFilters,
  WishlistResponse,
} from "../types";

const productApi = {
  /**
   * Get all products (with pagination and filtering)
   * @param filters Optional filters to apply
   * @returns Paginated list of products
   */
  getAllProducts: async (
    filters?: ProductFilters
  ): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>("/products", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get all products for admin (with pagination and filtering)
   * @param filters Optional filters to apply
   * @returns Paginated list of products with admin fields
   */
  getAdminProducts: async (
    filters?: ProductFilters
  ): Promise<ProductListResponse> => {
    const response = await axiosInstance.get<ProductListResponse>(
      "/products/admin",
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Get all product filters
   * @returns All product filters
   */
  getAllProductFilters: async (): Promise<AvailableProductFilters> => {
    const response = await axiosInstance.get<AvailableProductFilters>(
      "/products/filters"
    );
    return response.data;
  },

  /**
   * Get a product by ID
   * @param productId Product ID
   * @returns Product object
   */
  getProductById: async (productId: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${productId}`);
    return response.data;
  },

  /**
   * Get a product by slug
   * @param slug Product slug
   * @returns Product object
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },

  /**
   * Get a product by ID for admin (includes unpublished/inactive)
   * @param productId Product ID
   * @returns Product object with full admin fields
   */
  getProductByIdAdmin: async (productId: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(
      `/products/admin/id/${productId}`
    );
    return response.data;
  },

  /**
   * Get a product by slug for admin (includes unpublished/inactive)
   * @param slug Product slug
   * @returns Product object with full admin fields
   */
  getProductBySlugAdmin: async (slug: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(
      `/products/admin/slug/${slug}`
    );
    return response.data;
  },

  /**
   * Create a new product
   * @param productData Product data
   * @returns Created product
   */
  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.post<Product>(
      "/products",
      productData
    );
    return response.data;
  },

  /**
   * Update a product
   * @param productId Product ID
   * @param productData Updated product data
   * @returns Updated product
   */
  updateProduct: async (
    productId: string,
    productData: Partial<Product>
  ): Promise<Product> => {
    const response = await axiosInstance.put<Product>(
      `/products/${productId}`,
      productData
    );
    return response.data;
  },

  /**
   * Delete a product
   * @param productId Product ID
   * @returns Success message
   */
  deleteProduct: async (productId: string): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.delete<ApiResponse<string>>(
      `/products/${productId}`
    );
    return response.data;
  },

  /**
   * Add a product review
   * @param productId Product ID
   * @param reviewData Review data
   * @returns Updated product with review
   */
  addProductReview: async (
    productId: string,
    reviewData: {
      rating: number;
      title: string;
      content: string;
    }
  ): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.post<ApiResponse<Product>>(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  },

  /**
   * Get related products
   * @param productId Product ID
   * @param limit Number of products to return
   * @returns List of related products
   */
  getRelatedProducts: async (
    productId: string,
    limit = 4
  ): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(
      `/products/${productId}/related`,
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Get featured products
   * @param limit Number of products to return
   * @returns List of featured products
   */
  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>("/products/featured", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get new arrivals
   * @param limit Number of products to return
   * @returns List of new products
   */
  getNewArrivals: async (limit = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(
      "/products/new-arrivals",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Get best sellers
   * @param limit Number of products to return
   * @returns List of best selling products
   */
  getBestSellers: async (limit = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(
      "/products/best-sellers",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Update product inventory
   * @param productId Product ID
   * @param quantity New inventory quantity
   * @param variantId Optional variant ID for variant products
   * @returns Updated product
   */
  updateProductInventory: async (
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<ApiResponse<{ productId: string; inventoryQuantity: number }>> => {
    const response = await axiosInstance.put<
      ApiResponse<{ productId: string; inventoryQuantity: number }>
    >(`/products/${productId}/inventory`, { quantity, variantId });
    return response.data;
  },

  /**
   * Toggle product featured status
   * @param productId Product ID
   * @param isFeatured Featured status
   * @returns Updated product
   */
  toggleProductFeatured: async (
    productId: string,
    isFeatured: boolean
  ): Promise<ApiResponse<{ productId: string; isFeatured: boolean }>> => {
    const response = await axiosInstance.put<
      ApiResponse<{ productId: string; isFeatured: boolean }>
    >(`/products/${productId}/featured`, { isFeatured });
    return response.data;
  },

  /**
   * Toggle product published status
   * @param productId Product ID
   * @param isPublished Published status
   * @returns Updated product
   */
  toggleProductPublished: async (
    productId: string,
    isPublished: boolean
  ): Promise<ApiResponse<{ productId: string; isPublished: boolean }>> => {
    const response = await axiosInstance.put<
      ApiResponse<{ productId: string; isPublished: boolean }>
    >(`/products/${productId}/published`, { isPublished });
    return response.data;
  },

  /**
   * Toggle product in wishlist
   * @param productId Product ID
   * @returns Updated wishlist response
   */
  toggleProductInWishlist: async (
    productId: string
  ): Promise<WishlistResponse> => {
    const response = await axiosInstance.post<WishlistResponse>(
      `/products/${productId}/wishlist`
    );
    return response.data;
  },

  /**
   * Get all products in user's wishlist
   * @returns Array of products in wishlist
   */
  getWishlistProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>("/products/wishlist");
    return response.data;
  },

  /**
   * Check if the current user can review a product
   * @param productId Product ID
   * @returns Whether the user can review the product
   */
  canReviewProduct: async (
    productId: string
  ): Promise<{ canReview: boolean }> => {
    const response = await axiosInstance.get<{ canReview: boolean }>(
      `/products/${productId}/can-review`
    );
    return response.data;
  },
};

export default productApi;
