import { format } from "date-fns";

/**
 * Format a date-only value (like refillOn) without timezone offset issues.
 * Dates stored as UTC midnight will be treated as local date.
 */
export function formatDateOnly(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = new Date(date);
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), fmt);
}

/**
 * Format a datetime value in local time.
 */
export function formatDatetime(date: string | Date, fmt: string): string {
  return format(new Date(date), fmt);
}

/**
 * Get a Date object adjusted for UTC-stored date-only values.
 */
export function utcDateToLocal(date: string | Date): Date {
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
