import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';
import { LevelInfo } from '../../lib/levelUtils';
import { ProgressBar } from '../common/ProgressBar';

interface LevelSummaryCardProps {
  levelInfo: LevelInfo;
}

export const LevelSummaryCard: React.FC<LevelSummaryCardProps> = ({ levelInfo }) => {
  return (
    <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Progression Hero
          </h2>
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> All-Time: {levelInfo.totalXp} XP
        </span>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          {levelInfo.level}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {levelInfo.title}
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {levelInfo.isMaxLevel ? 'MAX LEVEL' : `${levelInfo.progressPercent}%`}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {levelInfo.isMaxLevel
              ? 'Selamat! Kamu telah mencapai tingkat tertinggi!'
              : `Butuh ${levelInfo.xpNeededForNextTier} XP lagi untuk naik ke Level ${levelInfo.level + 1}`}
          </p>

          <div className="mt-2">
            <ProgressBar
              value={levelInfo.progressPercent}
              color="emerald"
              height="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
