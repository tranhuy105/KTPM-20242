export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
