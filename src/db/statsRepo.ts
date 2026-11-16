import { db } from './index';
import { calculateStreaks, StreakResult } from '../lib/streakUtils';
import { calculateLevelInfo, LevelInfo } from '../lib/levelUtils';
import { getTotalAllTimeXp } from './xpRepo';
import { getLocalDateKey, parseLocalDateKey } from '../lib/dateUtils';
import { subDays, format } from 'date-fns';
import { id } from 'date-fns/locale/id';

/**
 * Gets streak threshold setting (default 0.8 / 80%)
 */
export async function getStreakThreshold(): Promise<number> {
  const setting = await db.app_settings.get('streakThresholdPercent');
  if (setting && typeof setting.value === 'number') {
    return setting.value / 100;
  }
  return 0.8;
}

export async function setStreakThreshold(percent: number): Promise<void> {
  await db.app_settings.put({
    key: 'streakThresholdPercent',
    value: percent
  });
}

/**
 * Computes full dayDataMap from daily_records table for all historical days
 */
export async function getHistoricalDayDataMap(): Promise<Map<string, { completedCount: number; totalActiveCount: number; xpSum: number }>> {
  const allRecords = await db.daily_records.toArray();
  const map = new Map<string, { completedCount: number; totalActiveCount: number; xpSum: number }>();

  for (const rec of allRecords) {
    let entry = map.get(rec.dateKey);
    if (!entry) {
      entry = { completedCount: 0, totalActiveCount: 0, xpSum: 0 };
      map.set(rec.dateKey, entry);
    }
    entry.totalActiveCount++;
    if (rec.isCompleted) {
      entry.completedCount++;
      entry.xpSum += rec.xpSnapshot || 0;
    }
  }

  return map;
}

/**
 * Computes current and best streak
 */
export async function getStreakStats(refDate: Date = new Date()): Promise<StreakResult> {
  const threshold = await getStreakThreshold();
  const dayMap = await getHistoricalDayDataMap();
  const todayKey = getLocalDateKey(refDate);

  return calculateStreaks(dayMap, threshold, todayKey);
}

/**
 * Computes full user progression profile
 */
export async function getUserProgression(refDate: Date = new Date()): Promise<{
  levelInfo: LevelInfo;
  streakStats: StreakResult;
  totalXp: number;
}> {
  const totalXp = await getTotalAllTimeXp();
  const levelInfo = calculateLevelInfo(totalXp);
  const streakStats = await getStreakStats(refDate);

  return {
    levelInfo,
    streakStats,
    totalXp
  };
}

export interface PeriodSummary {
  label: string;
  totalXp: number;
  completedQuests: number;
  totalQuests: number;
  completionRate: number; // 0 to 100
  successfulDays: number;
  totalDaysWithData: number;
  bestDayLabel?: string;
  lowestDayLabel?: string;
  chartData: { dateLabel: string; xp: number; completionRate: number }[];
}

export interface AnalyticsComparison {
  current: PeriodSummary;
  previous: PeriodSummary | null;
  xpDeltaPercent: number | null;
  completionRateDelta: number | null;
  insightText: string;
}

/**
 * Generates analytics for a given period range with comparison
 */
export async function getPeriodAnalytics(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  refDate: Date = new Date()
): Promise<AnalyticsComparison> {
  const threshold = await getStreakThreshold();
  const dayMap = await getHistoricalDayDataMap();

  let currentDates: string[] = [];
  let prevDates: string[] = [];
  let currentLabel = '';
  let prevLabel = '';

  const todayKey = getLocalDateKey(refDate);

  if (period === 'daily') {
    currentDates = [todayKey];
    prevDates = [getLocalDateKey(subDays(refDate, 1))];
    currentLabel = 'Hari Ini';
    prevLabel = 'Kemarin';
  } else if (period === 'weekly') {
    for (let i = 6; i >= 0; i--) {
      currentDates.push(getLocalDateKey(subDays(refDate, i)));
      prevDates.push(getLocalDateKey(subDays(refDate, i + 7)));
    }
    currentLabel = '7 Hari Terakhir';
    prevLabel = '7 Hari Sebelumnya';
  } else if (period === 'monthly') {
    for (let i = 29; i >= 0; i--) {
      currentDates.push(getLocalDateKey(subDays(refDate, i)));
      prevDates.push(getLocalDateKey(subDays(refDate, i + 30)));
    }
    currentLabel = '30 Hari Terakhir';
    prevLabel = '30 Hari Sebelumnya';
  } else {
    // Yearly: 12 months
    for (let i = 364; i >= 0; i -= 7) {
      currentDates.push(getLocalDateKey(subDays(refDate, i)));
      prevDates.push(getLocalDateKey(subDays(refDate, i + 365)));
    }
    currentLabel = '1 Tahun Terakhir';
    prevLabel = '1 Tahun Sebelumnya';
  }

  function summarizeDates(dates: string[], label: string): PeriodSummary {
    let totalXp = 0;
    let completedQuests = 0;
    let totalQuests = 0;
    let successfulDays = 0;
    let totalDaysWithData = 0;

    let bestDay = { label: '', rate: -1 };
    let lowestDay = { label: '', rate: 101 };

    const chartData = dates.map(dKey => {
      const data = dayMap.get(dKey) || { completedCount: 0, totalActiveCount: 0, xpSum: 0 };
      totalXp += data.xpSum;
      completedQuests += data.completedCount;
      totalQuests += data.totalActiveCount;

      const rate = data.totalActiveCount > 0 ? (data.completedCount / data.totalActiveCount) * 100 : 0;
      if (data.totalActiveCount > 0) {
        totalDaysWithData++;
        if (data.completedCount / data.totalActiveCount >= threshold) {
          successfulDays++;
        }
        if (rate > bestDay.rate) {
          bestDay = { label: format(parseLocalDateKey(dKey), 'd MMM', { locale: id }), rate };
        }
        if (rate < lowestDay.rate) {
          lowestDay = { label: format(parseLocalDateKey(dKey), 'd MMM', { locale: id }), rate };
        }
      }

      return {
        dateLabel: format(parseLocalDateKey(dKey), 'd MMM', { locale: id }),
        xp: data.xpSum,
        completionRate: Math.round(rate)
      };
    });

    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

    return {
      label,
      totalXp,
      completedQuests,
      totalQuests,
      completionRate,
      successfulDays,
      totalDaysWithData,
      bestDayLabel: bestDay.rate >= 0 ? `${bestDay.label} (${Math.round(bestDay.rate)}%)` : undefined,
      lowestDayLabel: lowestDay.rate <= 100 ? `${lowestDay.label} (${Math.round(lowestDay.rate)}%)` : undefined,
      chartData
    };
  }

  const currentSummary = summarizeDates(currentDates, currentLabel);
  const prevSummary = summarizeDates(prevDates, prevLabel);

  const hasPrevData = prevSummary.totalDaysWithData > 0;

  let xpDeltaPercent: number | null = null;
  let completionRateDelta: number | null = null;
  let insightText = '';

  if (!hasPrevData) {
    insightText = 'Belum ada data pembanding untuk periode sebelumnya.';
  } else {
    completionRateDelta = currentSummary.completionRate - prevSummary.completionRate;
    if (prevSummary.totalXp > 0) {
      xpDeltaPercent = Math.round(((currentSummary.totalXp - prevSummary.totalXp) / prevSummary.totalXp) * 100);
    } else {
      xpDeltaPercent = currentSummary.totalXp > 0 ? 100 : 0;
    }

    if (completionRateDelta > 0) {
      insightText = `Performa meningkat ${completionRateDelta}% dibandingkan ${prevLabel.toLowerCase()}. Pertahankan konsistensi!`;
    } else if (completionRateDelta < 0) {
      insightText = `Tingkat penyelesaian turun ${Math.abs(completionRateDelta)}% dibandingkan ${prevLabel.toLowerCase()}. Ayo tingkatkan lagi!`;
    } else {
      insightText = `Performa konsisten sama persis dengan ${prevLabel.toLowerCase()}. Mantap!`;
    }
  }

  return {
    current: currentSummary,
    previous: hasPrevData ? prevSummary : null,
    xpDeltaPercent,
    completionRateDelta,
    insightText
  };
}

export interface QuestBreakdownItem {
  questId: string;
  questName: string;
  icon: string;
  completedTimes: number;
  totalTrackedTimes: number;
  completionRate: number;
  totalXpGenerated: number;
}

/**
 * Returns breakdown of each quest's performance across history
 */
export async function getQuestBreakdown(): Promise<QuestBreakdownItem[]> {
  const allQuests = await db.quests.toArray();
  const allRecords = await db.daily_records.toArray();

  const map = new Map<string, { completed: number; total: number; xp: number }>();

  for (const rec of allRecords) {
    let entry = map.get(rec.questId);
    if (!entry) {
      entry = { completed: 0, total: 0, xp: 0 };
      map.set(rec.questId, entry);
    }
    entry.total++;
    if (rec.isCompleted) {
      entry.completed++;
      entry.xp += rec.xpSnapshot || 0;
    }
  }

  return allQuests.map(q => {
    const stats = map.get(q.id) || { completed: 0, total: 0, xp: 0 };
    const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return {
      questId: q.id,
      questName: q.name,
      icon: q.icon,
      completedTimes: stats.completed,
      totalTrackedTimes: stats.total,
      completionRate: rate,
      totalXpGenerated: stats.xp
    };
  }).sort((a, b) => b.completedTimes - a.completedTimes);
}
