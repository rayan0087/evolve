import React from 'react';
import { Gift, ChevronRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { EnrichedReward } from '../../db/rewardRepo';
import { ProgressBar } from '../common/ProgressBar';

interface NextRewardCardProps {
  reward?: EnrichedReward;
  onNavigateToRewards: () => void;
  onClaim?: (rewardId: string, periodStart: string) => void;
}

export const NextRewardCard: React.FC<NextRewardCardProps> = ({
  reward,
  onNavigateToRewards,
  onClaim
}) => {
  if (!reward) {
    return (
      <div className="bg-white dark:bg-[#121824] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Belum Ada Reward Aktif
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Tetapkan hadiah nyata untuk dirimu sendiri saat berhasil mencapai target XP!
        </p>
        <button
          onClick={onNavigateToRewards}
          className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
        >
          + Buat Reward Pertama
        </button>
      </div>
    );
  }

  const { reward: baseReward, earnedXp, progressPercent, remainingXp, status, periodBounds } = reward;

  return (
    <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Next Reward ({periodBounds.label})
          </h2>
        </div>
        <button
          onClick={onNavigateToRewards}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
        >
          Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-3xl flex items-center justify-center shrink-0 shadow-inner">
          {baseReward.imageOrEmoji || '🎁'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {baseReward.name}
            </h3>

            {status === 'unlocked' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                <Sparkles className="w-3 h-3" /> Terbuka!
              </span>
            )}
            {status === 'claimed' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Sudah Diklaim
              </span>
            )}
            {status === 'locked' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                <Lock className="w-3 h-3" /> Terkunci
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {baseReward.description || `Target: ${baseReward.targetXp} XP periode ini`}
          </p>

          <div className="flex items-center justify-between text-xs mt-2 font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">
              {earnedXp} / {baseReward.targetXp} XP
            </span>
            <span className="text-slate-400">
              {status === 'unlocked'
                ? 'Target tercapai!'
                : status === 'claimed'
                ? 'Selesai'
                : `Sisa ${remainingXp} XP`}
            </span>
          </div>

          <div className="mt-1.5">
            <ProgressBar
              value={progressPercent}
              color={status === 'unlocked' ? 'emerald' : 'amber'}
              height="sm"
            />
          </div>
        </div>
      </div>

      {status === 'unlocked' && onClaim && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => onClaim(baseReward.id, periodBounds.start)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Klaim Reward Sekarang!
          </button>
        </div>
      )}
    </div>
  );
};
