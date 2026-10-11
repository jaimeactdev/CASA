import { describe, expect, it, vi } from 'vitest';
import {
  addDays,
  BUSINESS_TIME_ZONE,
  calendarDate,
  calendarMonthsBetween,
  compareCalendarDates,
  isAfter,
  isOnOrBefore,
  lastDayOfMonth,
  parseIsoDate,
  toIsoDate,
  todayInBogota,
} from './calendar';

describe('calendarDate / parseIsoDate', () => {
  it('round-trips ISO dates and rejects impossible days', () => {
    expect(toIsoDate(parseIsoDate('2026-10-16'))).toBe('2026-10-16');
    expect(() => calendarDate(2026, 2, 29)).toThrow(/Invalid day/);
    expect(calendarDate(2024, 2, 29)).toEqual({ year: 2024, month: 2, day: 29 });
  });
});

describe('lastDayOfMonth', () => {
  it('returns the last calendar day, including leap February', () => {
    expect(lastDayOfMonth(2026, 10)).toEqual({ year: 2026, month: 10, day: 31 });
    expect(lastDayOfMonth(2024, 2)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(lastDayOfMonth(2025, 2)).toEqual({ year: 2025, month: 2, day: 28 });
  });
});

describe('addDays', () => {
  it('adds grace days across a month boundary (§8.2: 31 Oct + 3 = 3 Nov)', () => {
    expect(addDays({ year: 2026, month: 10, day: 31 }, 3)).toEqual({
      year: 2026,
      month: 11,
      day: 3,
    });
  });
});

describe('calendarMonthsBetween', () => {
  it('counts calendar months between the period and the current month (§8.2)', () => {
    const october = { year: 2026, month: 10 };
    expect(calendarMonthsBetween(october, { year: 2026, month: 11 })).toBe(1);
    expect(calendarMonthsBetween(october, { year: 2026, month: 12 })).toBe(2);
    expect(calendarMonthsBetween(october, { year: 2027, month: 1 })).toBe(3);
    expect(calendarMonthsBetween(october, october)).toBe(0);
  });
});

describe('compareCalendarDates', () => {
  it('orders dates and supports on-or-before / after', () => {
    const nov3 = { year: 2026, month: 11, day: 3 };
    const nov4 = { year: 2026, month: 11, day: 4 };
    expect(compareCalendarDates(nov3, nov4)).toBe(-1);
    expect(isOnOrBefore(nov3, nov3)).toBe(true);
    expect(isAfter(nov4, nov3)).toBe(true);
    expect(isAfter(nov3, nov3)).toBe(false);
  });
});

describe('todayInBogota', () => {
  it('uses America/Bogota and does not read the system clock', () => {
    expect(BUSINESS_TIME_ZONE).toBe('America/Bogota');
    const nowSpy = vi.spyOn(Date, 'now');

    // 2026-11-04 04:59:59 UTC = 3 Nov 23:59:59 in Bogotá (UTC-5).
    expect(todayInBogota(new Date('2026-11-04T04:59:59.000Z'))).toEqual({
      year: 2026,
      month: 11,
      day: 3,
    });
    // 2026-11-04 05:00:00 UTC = 4 Nov 00:00:00 in Bogotá.
    expect(todayInBogota(new Date('2026-11-04T05:00:00.000Z'))).toEqual({
      year: 2026,
      month: 11,
      day: 4,
    });
    expect(todayInBogota(new Date('2027-01-01T04:30:00.000Z'))).toEqual({
      year: 2026,
      month: 12,
      day: 31,
    });

    expect(nowSpy).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });
});
