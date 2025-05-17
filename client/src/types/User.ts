export interface Address {
  _id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface WishlistItem {
  _id?: string;
  product: string;
  addedAt?: string;
}

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      marketing?: boolean;
    };
    language?: string;
    currency?: string;
  };
  customerData?: {
    totalSpent?: number;
    orderCount?: number;
  };
  addresses?: Address[];
  wishlist?: WishlistItem[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
