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
  validNextStatuses?: string[];
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
