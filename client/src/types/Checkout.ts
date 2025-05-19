export interface CheckoutFormData {
  // Shipping information
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Payment information
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CheckoutAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderData {
  products: {
    productId: string;
    quantity: number;
    variantId?: string;
  }[];
  shipping: {
    method: string;
    cost: number;
    address: CheckoutAddress;
  };
  billing: {
    paymentMethod: string;
    address: CheckoutAddress;
  };
  customerNote?: string;
  ipAddress?: string;
  taxAmount?: number;
  discountTotal?: number;
  couponCode?: string;
}
