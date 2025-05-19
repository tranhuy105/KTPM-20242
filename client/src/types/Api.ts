import type { Order } from "./Order";
import type { User } from "./User";

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
