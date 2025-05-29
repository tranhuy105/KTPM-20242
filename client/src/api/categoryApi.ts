import axiosInstance from "./axiosInstance";
import type { Category, ApiResponse, CategoryFilters } from "../types";

// Define a custom response type for categories that matches the actual API response
interface CategoryListResponse {
  data: Category[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    links: {
      next?: string;
      first?: string;
      last?: string;
    };
  };
  timestamp: string;
}

const categoryApi = {
  /**
   * Get all categories (with pagination and filtering)
   * @param filters Optional filters to apply
   * @returns Paginated list of categories
   */
  getAllCategories: async (
    filters?: CategoryFilters
  ): Promise<ApiResponse<Category[]> & CategoryListResponse> => {
    const response = await axiosInstance.get<
      ApiResponse<Category[]> & CategoryListResponse
    >("/categories", {
      params: filters,
    });
    console.log(response.data);
    return response.data;
  },

  /**
   * Get a category by ID
   * @param categoryId Category ID
   * @returns Category object
   */
  getCategoryById: async (
    categoryId: string
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/${categoryId}`
    );
    return response.data;
  },

  /**
   * Get a category by slug
   * @param slug Category slug
   * @returns Category object
   */
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/slug/${slug}`
    );
    return response.data;
  },

  /**
   * Get category children (subcategories)
   * @param categoryId Category ID
   * @returns List of subcategories
   */
  getCategoryChildren: async (
    categoryId: string
  ): Promise<ApiResponse<Category[]>> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>(
      `/categories/${categoryId}/children`
    );
    return response.data;
  },

  /**
   * Create a new category
   * @param categoryData Category data
   * @returns Created category
   */
  createCategory: async (
    categoryData: Partial<Category>
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      "/categories",
      categoryData
    );
    return response.data;
  },

  /**
   * Update a category
   * @param categoryId Category ID
   * @param categoryData Updated category data
   * @returns Updated category
   */
  updateCategory: async (
    categoryId: string,
    categoryData: Partial<Category>
  ): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(
      `/categories/${categoryId}`,
      categoryData
    );
    return response.data;
  },

  /**
   * Delete a category - DEPRECATED
   * For data integrity, categories should be disabled (isActive: false) rather than deleted
   * Use updateCategory method with { isActive: false } instead
   */
};

export default categoryApi;
