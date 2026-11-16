import { describe, it, expect } from 'vitest';
import { calculateStreaks, isDaySuccessful } from '../src/lib/streakUtils';

describe('streakUtils', () => {
  it('identifies successful days meeting the 80% threshold', () => {
    // 4 out of 5 = 80% -> success
    expect(isDaySuccessful(4, 5, 0.8)).toBe(true);
    // 5 out of 6 = 83.3% -> success
    expect(isDaySuccessful(5, 6, 0.8)).toBe(true);
    // 3 out of 5 = 60% -> fail
    expect(isDaySuccessful(3, 5, 0.8)).toBe(false);
    // 0 active quests -> fail
    expect(isDaySuccessful(0, 0, 0.8)).toBe(false);
  });

  it('calculates current streak when today is completed', () => {
    const today = '2026-11-16';
    const dayMap = new Map([
      ['2026-11-14', { completedCount: 5, totalActiveCount: 5 }],
      ['2026-11-15', { completedCount: 4, totalActiveCount: 5 }],
      ['2026-11-16', { completedCount: 5, totalActiveCount: 5 }]
    ]);

    const result = calculateStreaks(dayMap, 0.8, today);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.todayStatus).toBe('completed');
  });

  it('keeps streak alive if today is still in progress but yesterday was completed', () => {
    const today = '2026-11-16';
    const dayMap = new Map([
      ['2026-11-14', { completedCount: 5, totalActiveCount: 5 }],
      ['2026-11-15', { completedCount: 5, totalActiveCount: 5 }],
      ['2026-11-16', { completedCount: 1, totalActiveCount: 5 }] // only 1 done today, in progress
    ]);

    const result = calculateStreaks(dayMap, 0.8, today);
    // Streak is 2 (from 14th and 15th), today is still in progress
    expect(result.currentStreak).toBe(2);
    expect(result.todayStatus).toBe('in_progress');
  });

  it('breaks streak when a previous day was missed', () => {
    const today = '2026-11-16';
    const dayMap = new Map([
      ['2026-11-13', { completedCount: 5, totalActiveCount: 5 }],
      ['2026-11-14', { completedCount: 1, totalActiveCount: 5 }], // missed (<80%)
      ['2026-11-15', { completedCount: 5, totalActiveCount: 5 }],
      ['2026-11-16', { completedCount: 5, totalActiveCount: 5 }]
    ]);

    const result = calculateStreaks(dayMap, 0.8, today);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(2);
  });
});
