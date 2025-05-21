import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Exchange rate for VND to USD (approximate)
const VND_TO_USD_RATE = 0.000041; // ~24,400 VND = 1 USD

// Get user's preferred currency from local storage or context
export function getUserCurrency(): string {
  // Try to get from localStorage first
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      if (userData?.preferences?.currency) {
        return userData.preferences.currency;
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
  }
  
  // Default to VND if no preference found
  return "VND";
}

// Format currency based on user preference
export function formatCurrency(value: number, forceCurrency?: string): string {
  const currency = forceCurrency || getUserCurrency();
  
  if (currency === "USD") {
    return formatCurrencyUSD(value);
  }
  
  // Default to VND
  return formatCurrencyVND(value);
}

export function formatCurrencyVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyUSD(value: number) {
  // Convert from VND to USD if needed
  const usdValue = value * VND_TO_USD_RATE;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usdValue);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateRelative(dateString: string) {
  // Format date to relative time (e.g., "2 days ago")
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
    });
  } catch {
    return dateString;
  }
}

export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
) {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}