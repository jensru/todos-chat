// src/lib/utils/dateUtils.ts - Centralized Date Utilities
/**
 * Centralized date formatting utilities to avoid duplication
 * and ensure consistent date handling across the application
 */

/**
 * Format a Date object to YYYY-MM-DD string (local timezone)
 * @param date - Date object to format
 * @returns YYYY-MM-DD string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to local Date object
 * @param dateString - YYYY-MM-DD string
 * @returns Date object in local timezone
 */
export function parseYYYYMMDDToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as YYYY-MM-DD string
 * @returns Today's date as YYYY-MM-DD string
 */
export function getTodayAsYYYYMMDD(): string {
  return formatDateToYYYYMMDD(new Date());
}

/**
 * Get tomorrow's date as YYYY-MM-DD string
 * @returns Tomorrow's date as YYYY-MM-DD string
 */
export function getTomorrowAsYYYYMMDD(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToYYYYMMDD(tomorrow);
}

/**
 * Format date string for display (German locale)
 * @param dateString - YYYY-MM-DD string
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dateString: string): string {
  if (dateString === 'ohne-datum') return 'Ohne Datum';

  try {
    const date = parseYYYYMMDDToDate(dateString);
    const todayStr = getTodayAsYYYYMMDD();
    const tomorrowStr = getTomorrowAsYYYYMMDD();

    if (dateString === todayStr) {
      return `Heute (${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`;
    } else if (dateString === tomorrowStr) {
      return `Morgen (${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`;
    } else {
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  } catch {
    return 'Ungültiges Datum';
  }
}

/**
 * Convert Date object to YYYY-MM-DD for API calls
 * @param date - Date object or null
 * @returns YYYY-MM-DD string or null
 */
export function convertDateForAPI(date: Date | null): string | null {
  if (!date) return null;
  return formatDateToYYYYMMDD(date);
}

/**
 * Parse database date string to local Date object
 * Handles both YYYY-MM-DD and ISO datetime strings
 * @param dateString - Date string from database
 * @returns Date object in local timezone or null
 */
export function parseDatabaseDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  
  // Handle YYYY-MM-DD format (preferred)
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Fallback for ISO datetime strings
  const parsedDate = new Date(dateString);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
}
