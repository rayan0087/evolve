import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  isValid
} from 'date-fns';
import { id } from 'date-fns/locale/id';
import { PeriodType } from './types';

/**
 * Returns YYYY-MM-DD in the user's local timezone.
 * Never uses toISOString() which shifts to UTC.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parses YYYY-MM-DD into a local Date object safely at 00:00:00 local time.
 */
export function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Format local date for display (e.g. "Senin, 16 Nov 2026")
 */
export function formatDisplayDate(dateOrKey: Date | string): string {
  const date = typeof dateOrKey === 'string' ? parseLocalDateKey(dateOrKey) : dateOrKey;
  if (!isValid(date)) return '';
  return format(date, 'EEEE, d MMM yyyy', { locale: id });
}

/**
 * Format short display (e.g. "16 Nov")
 */
export function formatShortDate(dateOrKey: Date | string): string {
  const date = typeof dateOrKey === 'string' ? parseLocalDateKey(dateOrKey) : dateOrKey;
  if (!isValid(date)) return '';
  return format(date, 'd MMM', { locale: id });
}

/**
 * Returns greeting based on local hour
 */
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export interface PeriodBounds {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  label: string;
}

/**
 * Computes period bounds (start and end dateKey) based on local calendar
 * - Weekly: Monday to Sunday
 * - Monthly: 1st to last day of month
 * - Quarterly: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
 * - Semiannual: H1 (Jan-Jun), H2 (Jul-Dec)
 * - Yearly: Jan 1 to Dec 31
 */
export function getPeriodBounds(periodType: PeriodType, refDate: Date = new Date()): PeriodBounds {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-11

  switch (periodType) {
    case 'weekly': {
      // Week starts on Monday (weekStartsOn: 1)
      const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });
      return {
        start: getLocalDateKey(weekStart),
        end: getLocalDateKey(weekEnd),
        label: `Minggu ini (${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy', { locale: id })})`
      };
    }
    case 'monthly': {
      const monthStart = startOfMonth(refDate);
      const monthEnd = endOfMonth(refDate);
      return {
        start: getLocalDateKey(monthStart),
        end: getLocalDateKey(monthEnd),
        label: format(refDate, 'MMMM yyyy', { locale: id })
      };
    }
    case 'quarterly': {
      // Q1: 0,1,2 | Q2: 3,4,5 | Q3: 6,7,8 | Q4: 9,10,11
      const quarterIndex = Math.floor(month / 3);
      const qStartMonth = quarterIndex * 3;
      const qEndMonth = qStartMonth + 2;
      const qStart = new Date(year, qStartMonth, 1);
      const qEnd = endOfMonth(new Date(year, qEndMonth, 1));
      return {
        start: getLocalDateKey(qStart),
        end: getLocalDateKey(qEnd),
        label: `Kuartal ${quarterIndex + 1} (${format(qStart, 'MMM')} - ${format(qEnd, 'MMM yyyy', { locale: id })})`
      };
    }
    case 'semiannual': {
      // H1: Jan - Jun | H2: Jul - Dec
      const halfIndex = month < 6 ? 0 : 1;
      const hStartMonth = halfIndex === 0 ? 0 : 6;
      const hEndMonth = halfIndex === 0 ? 5 : 11;
      const hStart = new Date(year, hStartMonth, 1);
      const hEnd = endOfMonth(new Date(year, hEndMonth, 1));
      return {
        start: getLocalDateKey(hStart),
        end: getLocalDateKey(hEnd),
        label: `Semester ${halfIndex + 1} (${format(hStart, 'MMM')} - ${format(hEnd, 'MMM yyyy', { locale: id })})`
      };
    }
    case 'yearly': {
      const yStart = startOfYear(refDate);
      const yEnd = endOfYear(refDate);
      return {
        start: getLocalDateKey(yStart),
        end: getLocalDateKey(yEnd),
        label: `Tahun ${year}`
      };
    }
  }
}

/**
 * Generates an array of dateKey strings for the past N days up to today.
 */
export function getPastDateKeys(days: number, refDate: Date = new Date()): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    result.push(getLocalDateKey(subDays(refDate, i)));
  }
  return result;
}

/**
 * Checks whether a given dateKey falls within [start, end] inclusive.
 */
export function isDateKeyBetween(dateKey: string, startKey: string, endKey: string): boolean {
  return dateKey >= startKey && dateKey <= endKey;
}
