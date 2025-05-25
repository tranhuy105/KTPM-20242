import axiosInstance from "./axiosInstance";
import type { Brand, ProductFilterBrand } from "../types";

interface BrandListResponse {
  brands: Brand[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

interface BrandFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  search?: string;
}

const brandApi = {
  /**
   * Get all brands (with pagination and filtering)
   * @param filters Optional filters to apply
   * @returns Paginated list of brands
   */
  getAllBrands: async (filters?: BrandFilters): Promise<BrandListResponse> => {
    const response = await axiosInstance.get<BrandListResponse>("/brands", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get brands with product counts
   * @returns List of brands with product counts
   */
  getBrandsWithProductCounts: async (): Promise<ProductFilterBrand[]> => {
    const response = await axiosInstance.get<ProductFilterBrand[]>(
      "/brands/with-product-counts"
    );
    return response.data;
  },

  /**
   * Get a brand by ID
   * @param brandId Brand ID
   * @returns Brand object
   */
  getBrandById: async (brandId: string): Promise<Brand> => {
    const response = await axiosInstance.get<Brand>(`/brands/${brandId}`);
    return response.data;
  },

  /**
   * Get a brand by slug
   * @param slug Brand slug
   * @returns Brand object
   */
  getBrandBySlug: async (slug: string): Promise<Brand> => {
    const response = await axiosInstance.get<Brand>(`/brands/slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new brand
   * @param brandData Brand data
   * @returns Created brand
   */
  createBrand: async (brandData: Partial<Brand>): Promise<Brand> => {
    const response = await axiosInstance.post<Brand>("/brands", brandData);
    return response.data;
  },

  /**
   * Update a brand
   * @param brandId Brand ID
   * @param brandData Updated brand data
   * @returns Updated brand
   */
  updateBrand: async (
    brandId: string,
    brandData: Partial<Brand>
  ): Promise<Brand> => {
    const response = await axiosInstance.put<Brand>(
      `/brands/${brandId}`,
      brandData
    );
    return response.data;
  },

  /**
   * Delete a brand - DEPRECATED
   * For data integrity, brands should be disabled (isActive: false) rather than deleted
   * Use updateBrand method with { isActive: false } instead
   */
};

export default brandApi;
