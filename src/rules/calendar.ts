/**
 * Business calendar in America/Bogota. Rules never read the system clock:
 * "today" is derived from an instant the caller passes in.
 */

export const BUSINESS_TIME_ZONE = 'America/Bogota';

export type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export type YearMonth = {
  readonly year: number;
  readonly month: number;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

export function calendarDate(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  if (!Number.isInteger(year) || year < 1) {
    throw new Error(`Invalid year: ${year}`);
  }
  const lastDay = daysInMonth(year, month);
  if (!Number.isInteger(day) || day < 1 || day > lastDay) {
    throw new Error(`Invalid day ${day} for ${year}-${month}`);
  }
  return { year, month, day };
}

export function parseIsoDate(iso: string): CalendarDate {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return calendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function toIsoDate(date: CalendarDate): string {
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${date.year}-${month}-${day}`;
}

export function yearMonthOf(date: CalendarDate): YearMonth {
  return { year: date.year, month: date.month };
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

export function isOnOrBefore(a: CalendarDate, b: CalendarDate): boolean {
  return compareCalendarDates(a, b) <= 0;
}

export function isAfter(a: CalendarDate, b: CalendarDate): boolean {
  return compareCalendarDates(a, b) > 0;
}

export function compareYearMonths(a: YearMonth, b: YearMonth): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  return 0;
}

/** Whole calendar months from `from` to `to`. October → December = 2. */
export function calendarMonthsBetween(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function lastDayOfMonth(year: number, month: number): CalendarDate {
  return calendarDate(year, month, daysInMonth(year, month));
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  if (!Number.isInteger(days)) {
    throw new Error('days must be an integer.');
  }
  const utc = Date.UTC(date.year, date.month - 1, date.day + days);
  const shifted = new Date(utc);
  return calendarDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

/**
 * Calendar date of `now` in America/Bogota. The instant is a parameter;
 * this function does not call `Date.now()`.
 */
export function todayInBogota(now: Date): CalendarDate {
  if (Number.isNaN(now.getTime())) {
    throw new Error('now must be a valid Date.');
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) {
      throw new Error(`Missing ${type} when converting to America/Bogota.`);
    }
    return Number(value);
  };

  return calendarDate(read('year'), read('month'), read('day'));
}
