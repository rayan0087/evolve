import { subDays } from 'date-fns';
import { getLocalDateKey, parseLocalDateKey } from './dateUtils';

export interface DaySuccessSummary {
  dateKey: string;
  completedCount: number;
  totalActiveCount: number;
  isSuccessful: boolean;
  completionRate: number; // 0 to 1
}

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  todayStatus: 'completed' | 'in_progress' | 'empty';
}

/**
 * Checks if a given day meets the success threshold.
 * Default threshold is 0.8 (80%).
 */
export function isDaySuccessful(
  completedCount: number,
  totalActiveCount: number,
  threshold: number = 0.8
): boolean {
  if (totalActiveCount <= 0) return false;
  return (completedCount / totalActiveCount) >= (threshold - 0.0001); // floating point tolerance
}

/**
 * Computes current streak and best streak based on a map of dateKey -> { completedCount, totalActiveCount }.
 */
export function calculateStreaks(
  dayDataMap: Map<string, { completedCount: number; totalActiveCount: number }>,
  threshold: number = 0.8,
  todayDateKey: string = getLocalDateKey()
): StreakResult {
  const todayDate = parseLocalDateKey(todayDateKey);
  const yesterdayKey = getLocalDateKey(subDays(todayDate, 1));

  const todayData = dayDataMap.get(todayDateKey);
  const isTodaySuccess = todayData
    ? isDaySuccessful(todayData.completedCount, todayData.totalActiveCount, threshold)
    : false;

  let todayStatus: 'completed' | 'in_progress' | 'empty' = 'empty';
  if (todayData && todayData.totalActiveCount > 0) {
    todayStatus = isTodaySuccess ? 'completed' : 'in_progress';
  }

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = todayDate;

  if (isTodaySuccess) {
    // Today already met threshold, count today and walk backward
    currentStreak = 1;
    checkDate = subDays(todayDate, 1);
    while (true) {
      const key = getLocalDateKey(checkDate);
      const data = dayDataMap.get(key);
      if (data && isDaySuccessful(data.completedCount, data.totalActiveCount, threshold)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  } else {
    // Today hasn't met threshold yet. Check if yesterday was successful.
    // If so, the streak is alive up to yesterday.
    const yesterdayData = dayDataMap.get(yesterdayKey);
    if (yesterdayData && isDaySuccessful(yesterdayData.completedCount, yesterdayData.totalActiveCount, threshold)) {
      currentStreak = 1;
      checkDate = subDays(todayDate, 2);
      while (true) {
        const key = getLocalDateKey(checkDate);
        const data = dayDataMap.get(key);
        if (data && isDaySuccessful(data.completedCount, data.totalActiveCount, threshold)) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  // 2. Calculate Best Streak across all sorted dateKeys in history
  const allDateKeys = Array.from(dayDataMap.keys()).sort();
  let bestStreak = currentStreak;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateKey of allDateKeys) {
    const data = dayDataMap.get(dateKey);
    const success = data ? isDaySuccessful(data.completedCount, data.totalActiveCount, threshold) : false;

    if (success) {
      const currDate = parseLocalDateKey(dateKey);
      if (prevDate) {
        const expectedNext = getLocalDateKey(subDays(currDate, 1));
        const prevKey = getLocalDateKey(prevDate);
        if (expectedNext === prevKey) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = currDate;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
      prevDate = null;
    }
  }

  return {
    currentStreak,
    bestStreak,
    todayStatus
  };
}
