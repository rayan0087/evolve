import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/index';
import { getHistoricalDayDataMap, getStreakStats, getStreakThreshold } from '../db/statsRepo';
import { CalendarGrid } from '../components/history/CalendarGrid';
import { StreakResult } from '../lib/streakUtils';
import { Flame, Trophy } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [dayMap, setDayMap] = useState<Map<string, { completedCount: number; totalActiveCount: number; xpSum: number }>>(new Map());
  const [streakStats, setStreakStats] = useState<StreakResult | null>(null);
  const [threshold, setThreshold] = useState<number>(0.8);

  const liveRecords = useLiveQuery(() => db.daily_records.toArray());

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [m, s, t] = await Promise.all([
        getHistoricalDayDataMap(),
        getStreakStats(),
        getStreakThreshold()
      ]);
      if (!isMounted) return;
      setDayMap(m);
      setStreakStats(s);
      setThreshold(t);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [liveRecords]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Histori & Kalender Konsistensi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau jejak rutinitas harianmu dan evaluasi konsistensi jangka panjang
          </p>
        </div>

        {streakStats && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Streak: {streakStats.currentStreak} Hari
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
              <Trophy className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Best: {streakStats.bestStreak} Hari
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <CalendarGrid dayMap={dayMap} threshold={threshold} />
    </div>
  );
};
