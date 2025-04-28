import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

export function getRandomRating(min = 3, max = 5): number {
  return Math.random() * (max - min) + min;
}

export function getRandomReviewCount(min = 5, max = 50): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function filterProducts<T extends { name: string; price: number; category?: string; subcategory?: string }>(
  products: T[],
  filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    subcategory?: string;
  }
): T[] {
  return products.filter(product => {
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Subcategory filter
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }
    
    return true;
  });
}

export function sortProducts<T extends { price: number; name: string }>(
  products: T[],
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
): T[] {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price_asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'name_asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sortedProducts;
  }
}
