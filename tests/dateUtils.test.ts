import { describe, it, expect } from 'vitest';
import {
  getLocalDateKey,
  parseLocalDateKey,
  getPeriodBounds,
  isDateKeyBetween
} from '../src/lib/dateUtils';

describe('dateUtils', () => {
  it('formats local dateKey in YYYY-MM-DD without UTC offset shift', () => {
    const d = new Date(2026, 10, 16); // 16 Nov 2026 local
    const key = getLocalDateKey(d);
    expect(key).toBe('2026-11-16');

    const parsed = parseLocalDateKey(key);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(16);
  });

  it('calculates weekly period bounds from Monday to Sunday', () => {
    // 2026-11-16 is Monday
    const refDate = new Date(2026, 10, 16);
    const bounds = getPeriodBounds('weekly', refDate);
    expect(bounds.start).toBe('2026-11-16');
    expect(bounds.end).toBe('2026-11-22');
  });

  it('calculates monthly period bounds', () => {
    const refDate = new Date(2026, 10, 16); // November has 30 days
    const bounds = getPeriodBounds('monthly', refDate);
    expect(bounds.start).toBe('2026-11-01');
    expect(bounds.end).toBe('2026-11-30');
  });

  it('calculates quarterly period bounds for Q4', () => {
    const refDate = new Date(2026, 10, 16); // Nov -> Q4 (Oct 1 - Dec 31)
    const bounds = getPeriodBounds('quarterly', refDate);
    expect(bounds.start).toBe('2026-10-01');
    expect(bounds.end).toBe('2026-12-31');
  });

  it('calculates semiannual period bounds for H2', () => {
    const refDate = new Date(2026, 10, 16); // Nov -> H2 (Jul 1 - Dec 31)
    const bounds = getPeriodBounds('semiannual', refDate);
    expect(bounds.start).toBe('2026-07-01');
    expect(bounds.end).toBe('2026-12-31');
  });

  it('calculates yearly period bounds', () => {
    const refDate = new Date(2026, 10, 16);
    const bounds = getPeriodBounds('yearly', refDate);
    expect(bounds.start).toBe('2026-01-01');
    expect(bounds.end).toBe('2026-12-31');
  });

  it('correctly checks isDateKeyBetween', () => {
    expect(isDateKeyBetween('2026-11-16', '2026-11-01', '2026-11-30')).toBe(true);
    expect(isDateKeyBetween('2026-10-31', '2026-11-01', '2026-11-30')).toBe(false);
    expect(isDateKeyBetween('2026-12-01', '2026-11-01', '2026-11-30')).toBe(false);
  });
});
