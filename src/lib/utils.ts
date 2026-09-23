/**
 * Utility functions for formatting, sanitizing, and calculating product data.
 */

export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculateOriginalPrice(discountedPrice: number, discountPercentage?: number): number {
  if (!discountPercentage || discountPercentage <= 0) return discountedPrice;
  return Number((discountedPrice / (1 - discountPercentage / 100)).toFixed(2));
}

export function sanitizeNumberParam(
  val: string | null | undefined,
  defaultValue: number,
  min: number = 1,
  max?: number
): number {
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed) || parsed < min) return defaultValue;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

export function sanitizePageSize(val: string | null | undefined, defaultValue: number = 10): number {
  const allowed = [10, 20, 50];
  const parsed = parseInt(val || '', 10);
  return allowed.includes(parsed) ? parsed : defaultValue;
}
