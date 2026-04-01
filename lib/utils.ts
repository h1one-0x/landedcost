// ============================================================
// LandedCost SaaS – General Utilities
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency ($1,234.56) */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/** Format a decimal as a percentage (0.125 -> "12.5%") */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
