/**
 * LIFE OS 3.0 — Precision Local Date & Time Utilities
 * 
 * Never use UTC string splitting for local dates!
 * In UTC+05:30 (India) or any timezone east of UTC, actions taken between 00:00 and 05:30 AM
 * produce the previous UTC calendar day, corrupting daily logs, streaks, and attendance.
 * 
 * All functions here operate strictly in the local environment timezone, with support
 * for configurable `dayStartHour` (defaults to 4 AM for student life cycles).
 */

/**
 * Converts a Date, ISO string, or timestamp into a local `YYYY-MM-DD` string.
 * Strictly uses local calendar components (getFullYear, getMonth, getDate).
 */
export function toLocalDateString(dateInput?: Date | string | number | null): string {
  if (!dateInput) return '';

  let d: Date;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    // Already in YYYY-MM-DD format
    return dateInput;
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the effective Date object, adjusting for dayStartHour cutoff.
 * If the hour is before dayStartHour (e.g. 2:00 AM with dayStartHour 4),
 * it is treated as part of the previous calendar day.
 */
export function getEffectiveDate(dateInput: Date = new Date(), dayStartHour: number = 4): Date {
  const d = new Date(dateInput.getTime());
  if (dayStartHour > 0 && d.getHours() < dayStartHour) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

/**
 * Returns today's date in `YYYY-MM-DD` local time.
 * Optional `dayStartHour` shifts the day boundary (e.g., 4 = day rolls over at 4:00 AM).
 */
export function todayLocal(dayStartHour?: number): string {
  const now = new Date();
  if (typeof dayStartHour === 'number' && dayStartHour > 0) {
    return toLocalDateString(getEffectiveDate(now, dayStartHour));
  }
  return toLocalDateString(now);
}

/**
 * Returns a Date object representing the start of the day in local time.
 * If dayStartHour > 0, sets hour to dayStartHour; otherwise sets to 00:00:00.000.
 */
export function startOfDay(dateInput: Date = new Date(), dayStartHour: number = 4): Date {
  const d = new Date(dateInput.getTime());
  if (dayStartHour > 0 && d.getHours() < dayStartHour) {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(dayStartHour > 0 ? dayStartHour : 0, 0, 0, 0);
  return d;
}

/**
 * Returns tomorrow's date in `YYYY-MM-DD` local time.
 */
export function tomorrowLocal(dayStartHour?: number): string {
  const d = new Date();
  if (typeof dayStartHour === 'number' && dayStartHour > 0) {
    const eff = getEffectiveDate(d, dayStartHour);
    eff.setDate(eff.getDate() + 1);
    return toLocalDateString(eff);
  }
  d.setDate(d.getDate() + 1);
  return toLocalDateString(d);
}

/**
 * Formats an amount using Indian Numbering System (`en-IN`) with INR currency symbol.
 * Example: 150000 -> "₹1,50,000"
 */
export function formatCurrencyINR(amount: number, fractionDigits: number = 0): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(amount);
}
