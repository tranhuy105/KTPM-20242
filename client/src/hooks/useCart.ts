import { useState, useEffect, useCallback } from "react";
import type { Product, ProductVariant } from "../types";

interface CartItem {
  id: string;
  slug: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  itemCount: number;
}

interface CartFunctions {
  addItem: (
    product: Product,
    quantity: number,
    variant?: ProductVariant
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const initialCartState: CartState = {
  items: [],
  total: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  itemCount: 0,
};

// Tax rate as a percentage
const TAX_RATE = 0.07; // 7%
// Shipping is calculated based on order total
const calculateShipping = (subtotal: number): number => {
  // Free shipping for orders over $100
  if (subtotal >= 100) return 0;
  // Base shipping cost is $10
  return 10;
};

/**
 * Custom hook for cart functionality
 * @returns Cart state and functions for managing cart
 */
const useCart = (): CartState & CartFunctions => {
  const [cart, setCart] = useState<CartState>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : initialCartState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Calculate totals whenever items change
  const calculateTotals = useCallback(
    (items: CartItem[]): Omit<CartState, "items"> => {
      const itemCount = items.reduce((count, item) => count + item.quantity, 0);
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * TAX_RATE;
      const shipping = calculateShipping(subtotal);
      const total = subtotal + tax + shipping;

      return {
        subtotal,
        tax,
        shipping,
        total,
        itemCount,
      };
    },
    []
  );

  // Add an item to the cart
  const addItem = useCallback(
    (product: Product, quantity: number, variant?: ProductVariant) => {
      setCart((prevCart) => {
        const price = variant?.price ?? product.price;
        const existingItemIndex = prevCart.items.findIndex(
          (item) =>
            item.productId === product._id &&
            item.variantId === (variant?._id ?? undefined)
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Item already exists, update quantity
          newItems = [...prevCart.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            id: variant ? `${product._id}-${variant._id}` : product._id,
            slug: product.slug,
            productId: product._id,
            name: product.name,
            price,
            quantity,
            image: variant?.images?.[0] ?? product.images[0],
            variantId: variant?._id,
            variantName: variant?.name,
          };
          newItems = [...prevCart.items, newItem];
        }

        return {
          items: newItems,
          ...calculateTotals(newItems),
        };
      });
    },
    [calculateTotals]
  );

  // Remove an item from the cart
  const removeItem = useCallback(
    (itemId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.id !== itemId);
        return {
          items: newItems,
          ...calculateTotals(newItems),
        };
      });
    },
    [calculateTotals]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        return {
          items: newItems,
          ...calculateTotals(newItems),
        };
      });
    },
    [calculateTotals, removeItem]
  );

  // Clear the cart
  const clearCart = useCallback(() => {
    setCart(initialCartState);
  }, []);

  // Check if a product is already in the cart
  const isInCart = useCallback(
    (productId: string, variantId?: string) => {
      return cart.items.some(
        (item) => item.productId === productId && item.variantId === variantId
      );
    },
    [cart.items]
  );

  return {
    ...cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
  };
};

export default useCart;
