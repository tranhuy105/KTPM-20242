import type { Order } from "./Order";
import type { User, WishlistItem } from "./User";

export interface ApiResponse<T> {
  message?: string;
  success?: boolean;
  error?: string;
  data?: T;
}

export interface PaginatedUserResponse {
  users: User[];
  pagination: Pagination;
}

export interface PaginatedOrderResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WishlistResponse {
  message: string;
  success: boolean;
  wishlist: WishlistItem[];
}

