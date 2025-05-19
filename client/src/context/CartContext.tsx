import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { CartItem } from "../types/Cart";
import type { Cart } from "../types";

// Initial state
const initialState: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Action types
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; variantId?: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; variantId?: string; quantity: number };
    }
  | { type: "CLEAR_CART" };

// Reducer
const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity:
            newItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      // Calculate totals
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return { items: newItems, totalItems, totalPrice };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.variantId === action.payload.variantId
          )
      );

      // Calculate totals
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return { items: newItems, totalItems, totalPrice };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) => {
        if (
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
        ) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });

      // Filter out items with quantity 0
      const filteredItems = newItems.filter((item) => item.quantity > 0);

      // Calculate totals
      const totalItems = filteredItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = filteredItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return { items: filteredItems, totalItems, totalPrice };
    }

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
};

// Context
interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : initialState;
  });

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Context actions
  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (productId: string, variantId?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variantId?: string
  ) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, variantId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
