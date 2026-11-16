import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Reward, PeriodType } from '../../lib/types';

interface RewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rewardData: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  editingReward?: Reward | null;
}

const COMMON_EMOJIS = ['🎬', '☕', '🍛', '🍔', '🎁', '🎮', '✈️', '🎧', '🍕', '🍰', '👟', '🏖️'];

export const RewardFormModal: React.FC<RewardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingReward
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageOrEmoji, setImageOrEmoji] = useState('🎁');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [targetXp, setTargetXp] = useState('1000');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReward) {
      setName(editingReward.name);
      setDescription(editingReward.description || '');
      setImageOrEmoji(editingReward.imageOrEmoji || '🎁');
      setPeriodType(editingReward.periodType);
      setTargetXp(editingReward.targetXp.toString());
      setIsActive(editingReward.isActive);
    } else {
      setName('');
      setDescription('');
      setImageOrEmoji('🎁');
      setPeriodType('monthly');
      setTargetXp('1000');
      setIsActive(true);
    }
  }, [editingReward, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: editingReward?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        imageOrEmoji: imageOrEmoji.trim() || '🎁',
        periodType,
        targetXp: parseInt(targetXp, 10) || 500,
        isActive
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReward ? 'Edit Reward' : 'Buat Reward Baru'}
      description="Tentukan hadiah motivasi nyata yang ingin kamu raih atas konsistensimu."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Emoji Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Emoji / Simbol Reward
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {imageOrEmoji || '🎁'}
            </span>
            <input
              type="text"
              maxLength={4}
              value={imageOrEmoji}
              onChange={e => setImageOrEmoji(e.target.value)}
              placeholder="Ketik emoji..."
              className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setImageOrEmoji(emoji)}
                className="text-lg p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Reward <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Mukbang Nasi Goreng, Beli Sepatu Baru"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deskripsi Hadiah (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detail perayaan atau reward"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Period Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Periode Pengumpulan XP <span className="text-rose-500">*</span>
          </label>
          <select
            value={periodType}
            onChange={e => setPeriodType(e.target.value as PeriodType)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="weekly">Mingguan (Senin - Minggu)</option>
            <option value="monthly">Bulanan (Tanggal 1 - Akhir Bulan)</option>
            <option value="quarterly">Kuartalan (3 Bulan / Triwulan)</option>
            <option value="semiannual">Semesteran (6 Bulan)</option>
            <option value="yearly">Tahunan (Januari - Desember)</option>
          </select>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            XP dihitung berdasarkan perolehan di dalam periode kalender tersebut.
          </p>
        </div>

        {/* Target XP */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target XP yang Dibutuhkan <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min="10"
            step="10"
            value={targetXp}
            onChange={e => setTargetXp(e.target.value)}
            placeholder="Contoh: 1000 atau 2000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="rewardActiveCheckbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="rewardActiveCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Reward ini aktif dan dapat dikejar
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            {isSubmitting ? 'Menyimpan...' : editingReward ? 'Simpan Perubahan' : 'Buat Reward'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
