
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price number to a readable format with FCFA currency
 * @param price The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "N/A";
  return price.toLocaleString('fr-FR') + " FCFA";
}
