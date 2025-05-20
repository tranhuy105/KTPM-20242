import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
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