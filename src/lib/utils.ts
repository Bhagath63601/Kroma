// ============================================================
// Kroma E-Commerce — Utility Functions
// ============================================================

import { type ClassValue, clsx } from './clsx';

/**
 * Tiny clsx-like utility for merging class names.
 * Supports strings, arrays, and conditional objects.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  currencySymbol: string = '₹'
): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currencySymbol}${formatted}`;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Calculate percentage discount between two prices.
 */
export function calcDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Check if a sale is currently active.
 */
export function isSaleActive(
  salePrice: number | null,
  saleStart: string | null,
  saleEnd: string | null
): boolean {
  if (!salePrice) return false;
  const now = new Date();
  if (saleStart && new Date(saleStart) > now) return false;
  if (saleEnd && new Date(saleEnd) < now) return false;
  return true;
}

/**
 * Get effective price of a product (considering sale).
 */
export function getEffectivePrice(
  price: number,
  salePrice: number | null,
  saleStart: string | null,
  saleEnd: string | null
): number {
  if (isSaleActive(salePrice, saleStart, saleEnd) && salePrice !== null) {
    return salePrice;
  }
  return price;
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Format a date string to a short format.
 */
export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Generate a random ID.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get star rating distribution for reviews.
 */
export function getStarDistribution(
  reviews: { rating: number }[]
): { stars: number; count: number; percentage: number }[] {
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });
  return distribution;
}

/**
 * Calculate average rating from reviews.
 */
export function getAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
