import React from 'react';
import { Zap, Target } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

interface DailyProgressCardProps {
  completedCount: number;
  totalCount: number;
  todayXp: number;
}

export const DailyProgressCard: React.FC<DailyProgressCardProps> = ({
  completedCount,
  totalCount,
  todayXp
}) => {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#121824] dark:to-[#182030] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Progres Hari Ini
            </h2>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedCount} <span className="text-lg font-medium text-slate-400">/ {totalCount}</span>
            </span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ({completionRate}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAllDone
              ? '🎉 Luar biasa! Semua quest hari ini telah selesai!'
              : remainingCount > 0
              ? `Tersisa ${remainingCount} quest lagi untuk diselesaikan hari ini.`
              : 'Belum ada quest aktif. Tambahkan quest baru di Kelola Quest untuk memulai!'}
          </p>
        </div>

        {/* Daily XP Stat Box */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-xl self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block uppercase">
              XP Hari Ini
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              +{todayXp} <span className="text-xs font-semibold">XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <ProgressBar
          value={completionRate}
          color={isAllDone ? 'emerald' : 'blue'}
          height="md"
        />
      </div>
    </div>
  );
};
