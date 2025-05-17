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
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  weight: number;
  weightUnit: string;
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
  shortDescription: string;
  brand: string;
  images: ProductImage[] | string[];
  category: ProductCategory | string;
  categoryName?: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  inventoryQuantity: number;
  inventoryTracking: boolean;
  averageRating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  seo?: ProductSEO;
  createdAt: string;
  updatedAt: string;
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
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Filter Types
export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  brand?: string;
  tags?: string;
  status?: string;
  featured?: boolean;
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

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  ancestors: CategoryAncestor[];
  id: string;
}

export interface CategoryAncestor {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}
