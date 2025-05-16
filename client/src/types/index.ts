// User Types
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

// Product Types
export interface ProductImage {
  _id?: string;
  url: string;
  alt?: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  inventoryQuantity: number;
  images?: string[] | ProductImage[];
}

export interface ProductReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string | Category;
  categoryName?: string;
  images: string[] | ProductImage[];
  isFeatured?: boolean;
  isPublished?: boolean;
  status: "in-stock" | "out-of-stock" | "back-order" | "active";
  inventoryQuantity?: number;
  hasVariants?: boolean;
  // variants?: ProductVariant[];
  tags?: string[];
  specs?: Record<string, string>;
  averageRating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt?: string;
  compareAtPrice?: number | null;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  id?: string;
  description?: string;
  image?: string;
  parent?: string;
  parentName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Order Types
export interface OrderItem {
  _id: string;
  product: string;
  productSnapshot: {
    name: string;
    description?: string;
    sku?: string;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
  discount?: number;
  itemTotal: number;
  variant?: string;
  variantAttributes?: Record<string, string>;
}

export interface OrderAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderTransaction {
  _id: string;
  type: "payment" | "refund" | "capture" | "authorization";
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  method?: string;
  gateway: string;
  gatewayTransactionId?: string;
  currency: string;
  createdAt: string;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  comment?: string;
  updatedBy?: string;
}

export interface OrderTracking {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
}

export interface OrderNote {
  _id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  userSnapshot: {
    email: string;
    name: string;
  };
  products: OrderItem[];
  status:
    | "pending"
    | "processing"
    | "payment_pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "partially_refunded"
    | "on_hold";
  statusHistory?: StatusHistory[];
  paymentStatus:
    | "pending"
    | "authorized"
    | "paid"
    | "partially_refunded"
    | "refunded"
    | "failed";
  fulfillmentStatus:
    | "unfulfilled"
    | "partially_fulfilled"
    | "fulfilled"
    | "returned"
    | "partially_returned";
  shipping: {
    method: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    cost: number;
    address: OrderAddress;
  };
  billing: {
    paymentMethod: string;
    lastFourDigits?: string;
    cardType?: string;
    address: OrderAddress;
  };
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountTotal: number;
  totalAmount: number;
  currency: string;
  couponCode?: string;
  customerNote?: string;
  internalNotes?: OrderNote[];
  transactions?: OrderTransaction[];
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CategoryFilters {
  parent?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
