import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toLocalDateString,
  getEffectiveDate,
  todayLocal,
  startOfDay,
  tomorrowLocal,
  formatCurrencyINR,
} from '../src/lib/dates';

describe('dates utility library', () => {
  describe('toLocalDateString', () => {
    it('correctly converts Date object using local components', () => {
      // Create local date: 2026-11-25 00:30:00 local time
      const date = new Date(2026, 10, 25, 0, 30, 0); // Month 10 is November
      expect(toLocalDateString(date)).toBe('2026-11-25');
    });

    it('correctly converts Date object at 23:59 local time', () => {
      const date = new Date(2026, 10, 25, 23, 59, 59);
      expect(toLocalDateString(date)).toBe('2026-11-25');
    });

    it('passes through existing YYYY-MM-DD string', () => {
      expect(toLocalDateString('2026-11-24')).toBe('2026-11-24');
    });

    it('handles empty or invalid input gracefully', () => {
      expect(toLocalDateString(null)).toBe('');
      expect(toLocalDateString(undefined)).toBe('');
      expect(toLocalDateString('invalid-date')).toBe('');
    });
  });

  describe('getEffectiveDate with dayStartHour', () => {
    it('shifts date back 1 day when hour is before dayStartHour (e.g. 02:00 with cutoff 4)', () => {
      const earlyMorning = new Date(2026, 10, 25, 2, 0, 0); // Nov 25, 2 AM
      const effective = getEffectiveDate(earlyMorning, 4);
      expect(effective.getDate()).toBe(24);
      expect(toLocalDateString(effective)).toBe('2026-11-24');
    });

    it('preserves date when hour is after dayStartHour (e.g. 05:00 with cutoff 4)', () => {
      const morning = new Date(2026, 10, 25, 5, 0, 0); // Nov 25, 5 AM
      const effective = getEffectiveDate(morning, 4);
      expect(effective.getDate()).toBe(25);
      expect(toLocalDateString(effective)).toBe('2026-11-25');
    });

    it('preserves date when hour is at late night 23:59', () => {
      const night = new Date(2026, 10, 25, 23, 59, 0);
      const effective = getEffectiveDate(night, 4);
      expect(effective.getDate()).toBe(25);
      expect(toLocalDateString(effective)).toBe('2026-11-25');
    });
  });

  describe('startOfDay', () => {
    it('sets hour to dayStartHour in local time', () => {
      const sample = new Date(2026, 10, 25, 14, 30, 0);
      const sod = startOfDay(sample, 4);
      expect(sod.getHours()).toBe(4);
      expect(sod.getMinutes()).toBe(0);
      expect(sod.getSeconds()).toBe(0);
      expect(toLocalDateString(sod)).toBe('2026-11-25');
    });
  });

  describe('formatCurrencyINR', () => {
    it('formats numbers according to Indian numbering system (lakhs/crores)', () => {
      const formatted = formatCurrencyINR(150000);
      // In en-IN, 1,50,000 has grouping of 2 after the first 3
      expect(formatted).toContain('1,50,000');
      expect(formatted).toContain('₹');
    });

    it('handles zero and negative amounts', () => {
      expect(formatCurrencyINR(0)).toContain('0');
      expect(formatCurrencyINR(NaN)).toBe('₹0');
    });
  });
});
