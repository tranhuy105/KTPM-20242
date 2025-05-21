import type { Brand } from "./Brand";
import type { ProductCategory } from "./Category";

export interface ProductImage {
  _id?: string;
  url: string;
  alt?: string;
  isDefault?: boolean;
}


export interface UserProductReview {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  fullName: string;
  id: string;
}

export interface ProductReview {
  _id: string;
  user: UserProductReview;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brand?: Brand | string;
  brandName?: string;
  images: ProductImage[];
  category:
    | {
        _id: string;
        name: string;
        slug: string;
        ancestors?: {
          _id: string;
          name: string;
          slug: string;
          id: string;
        }[];
        id: string;
      }
    | string;
  categoryName?: string;
  additionalCategories?: ProductCategory[];
  tags?: string[];
  price: number;
  compareAtPrice: number | null;
  status: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  inventoryQuantity: number;
  inventoryTracking?: boolean;
  averageRating: number;
  reviewCount: number;
  color?: string;
  size?: string;
  material?: string;
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
    origin?: string;
    warranty?: string;
    [key: string]: string | undefined;
  };
  releaseDate?: string;
  reviews?: ProductReview[];
  seo?: ProductSEO;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cursor?: string;
  cursorDirection?: "next" | "prev";
  filters?: {
    category?: string;
    brand?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isPublished?: boolean;
    tags?: string | string[];
    color?: string;
    size?: string;
    material?: string;
  };
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
    limit: number;
  };
}
