import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { EnrichedReward } from '../../db/rewardRepo';

interface RewardCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: EnrichedReward;
  onConfirmClaim: (rewardId: string, periodStart: string) => Promise<void>;
}

export const RewardCelebrationModal: React.FC<RewardCelebrationModalProps> = ({
  isOpen,
  onClose,
  reward,
  onConfirmClaim
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti bursts
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55
      });
      fire(0.2, {
        spread: 60
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45
      });
    }
  }, [isOpen]);

  if (!reward) return null;

  const handleClaim = async () => {
    await onConfirmClaim(reward.reward.id, reward.periodBounds.start);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selamat! Reward Terbuka! 🎉"
    >
      <div className="text-center py-4 space-y-4">
        {/* Emoji Centerpiece */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-5xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10 animate-bounce">
          {reward.reward.imageOrEmoji || '🎁'}
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {reward.reward.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {reward.reward.description || 'Kamu telah berhasil membuktikan dedikasi dan konsistensi luar biasa!'}
          </p>
        </div>

        {/* Milestone Achievement Stats */}
        <div className="bg-slate-50 dark:bg-[#182030] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Periode Pencapaian:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{reward.periodBounds.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Target XP:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{reward.reward.targetXp} XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">XP Terkumpul:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{reward.earnedXp} XP</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-400 italic">
            *XP adalah catatan pencapaian dan tidak akan terpotong saat kamu mengklaim reward ini.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleClaim}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            Klaim & Nikmati Reward Ini!
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </Modal>
  );
};
