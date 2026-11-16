import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/index';
import { getPeriodAnalytics, getQuestBreakdown, AnalyticsComparison, QuestBreakdownItem } from '../db/statsRepo';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { ActivityBreakdownTable } from '../components/analytics/ActivityBreakdownTable';
import { TrendingUp, TrendingDown, Target, Zap, CheckCircle2, Award, Info } from 'lucide-react';

type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface AnalyticsPageProps {
  isDark?: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ isDark = true }) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('weekly');
  const [analytics, setAnalytics] = useState<AnalyticsComparison | null>(null);
  const [breakdown, setBreakdown] = useState<QuestBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  const liveRecords = useLiveQuery(() => db.daily_records.toArray());
  const liveXpTx = useLiveQuery(() => db.xp_transactions.toArray());

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      setLoading(true);
      const [res, bk] = await Promise.all([
        getPeriodAnalytics(period),
        getQuestBreakdown()
      ]);
      if (!isMounted) return;
      setAnalytics(res);
      setBreakdown(bk);
      setLoading(false);
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [period, liveRecords, liveXpTx]);

  const periodOptions: { id: AnalyticsPeriod; label: string }[] = [
    { id: 'daily', label: 'Harian' },
    { id: 'weekly', label: 'Mingguan (7 Hari)' },
    { id: 'monthly', label: 'Bulanan (30 Hari)' },
    { id: 'yearly', label: 'Tahunan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Analytics & Statistik Performa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis data aktual langsung dari IndexedDB lokal tanpa perkiraan palsu
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#182030] rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {periodOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                period === opt.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !analytics ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Memuat analisis data...
        </div>
      ) : (
        <>
          {/* Insight Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                Insight Periode: {analytics.current.label}
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {analytics.insightText}
              </p>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total XP */}
            <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total XP</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                +{analytics.current.totalXp} <span className="text-xs font-medium text-slate-400">XP</span>
              </div>
              {analytics.xpDeltaPercent !== null && (
                <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                  {analytics.xpDeltaPercent >= 0 ? (
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +{analytics.xpDeltaPercent}%
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {analytics.xpDeltaPercent}%
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px]">vs periode lalu</span>
                </div>
              )}
            </div>

            {/* 2. Completion Rate */}
            <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Completion Rate</span>
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.current.completionRate}%
              </div>
              {analytics.completionRateDelta !== null && (
                <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                  {analytics.completionRateDelta >= 0 ? (
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> +{analytics.completionRateDelta}%
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> {analytics.completionRateDelta}%
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px]">vs periode lalu</span>
                </div>
              )}
            </div>

            {/* 3. Quest Selesai */}
            <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quest Selesai</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.current.completedQuests} <span className="text-xs font-medium text-slate-400">/ {analytics.current.totalQuests}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                Akumulasi quest terselesaikan
              </div>
            </div>

            {/* 4. Hari Sukses (>=80%) */}
            <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hari Sukses</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics.current.successfulDays} <span className="text-xs font-medium text-slate-400">hari</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                {analytics.current.bestDayLabel ? `Terbaik: ${analytics.current.bestDayLabel}` : 'Mencapai target konsistensi'}
              </div>
            </div>
          </div>

          {/* Recharts Trends */}
          <AnalyticsCharts summary={analytics.current} isDark={isDark} />

          {/* Activity Breakdown Table */}
          <ActivityBreakdownTable items={breakdown} />
        </>
      )}
    </div>
  );
};
