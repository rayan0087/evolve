import React from 'react';
import { Sparkles, CheckCircle2, Lock, Edit2, Trash2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { EnrichedReward } from '../../db/rewardRepo';
import { ProgressBar } from '../common/ProgressBar';

interface RewardCardProps {
  enrichedReward: EnrichedReward;
  onClaim: (rewardId: string, periodStart: string) => void;
  onEdit: (reward: EnrichedReward['reward']) => void;
  onDelete: (rewardId: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  enrichedReward,
  onClaim,
  onEdit,
  onDelete
}) => {
  const { reward, earnedXp, progressPercent, remainingXp, status, periodBounds, isUnlocked, isClaimed } = enrichedReward;

  const periodLabels: Record<string, string> = {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    quarterly: 'Kuartalan (3 Bln)',
    semiannual: 'Semesteran (6 Bln)',
    yearly: 'Tahunan'
  };

  return (
    <div
      className={clsx(
        'relative bg-white dark:bg-[#121824] border rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between',
        isUnlocked
          ? 'border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : isClaimed
          ? 'border-slate-200 dark:border-slate-800/80 opacity-90'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      )}
    >
      <div>
        {/* Top Header: Period Badge & Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
            {periodLabels[reward.periodType] || reward.periodType}
          </span>

          {isUnlocked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Terbuka!
            </span>
          )}
          {isClaimed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sudah Diklaim
            </span>
          )}
          {status === 'in_progress' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Sedang Berjalan
            </span>
          )}
          {status === 'locked' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Terkunci (0 XP)
            </span>
          )}
        </div>

        {/* Reward Content */}
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/20 text-3xl flex items-center justify-center shrink-0 shadow-inner">
            {reward.imageOrEmoji || '🎁'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {reward.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {reward.description || 'Tidak ada deskripsi.'}
            </p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
              Periode: {periodBounds.label}
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-emerald-600 dark:text-emerald-400">
              {earnedXp} / {reward.targetXp} XP
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {isUnlocked
                ? 'Target Tercapai!'
                : isClaimed
                ? 'Pencapaian Selesai'
                : `Kurang ${remainingXp} XP`}
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            color={isUnlocked ? 'emerald' : isClaimed ? 'blue' : 'amber'}
            height="sm"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(reward)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit Reward"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(reward.id)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Hapus Reward"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {isUnlocked && (
          <button
            onClick={() => onClaim(reward.id, periodBounds.start)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Klaim Reward!
          </button>
        )}
      </div>
    </div>
  );
};
