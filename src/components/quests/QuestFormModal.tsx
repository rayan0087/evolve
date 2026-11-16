import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Quest } from '../../lib/types';
import { IconRenderer, AVAILABLE_ICONS } from '../common/IconRenderer';

interface QuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { id?: string }) => Promise<void>;
  editingQuest?: Quest | null;
}

export const QuestFormModal: React.FC<QuestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingQuest
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [targetNumber, setTargetNumber] = useState<string>('');
  const [unit, setUnit] = useState('');
  const [icon, setIcon] = useState('Flame');
  const [xpReward, setXpReward] = useState('20');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuest) {
      setName(editingQuest.name);
      setDescription(editingQuest.description || '');
      setTarget(editingQuest.target);
      setTargetNumber(editingQuest.targetNumber?.toString() || '');
      setUnit(editingQuest.unit || '');
      setIcon(editingQuest.icon || 'Flame');
      setXpReward(editingQuest.xpReward.toString());
      setIsActive(editingQuest.isActive);
    } else {
      setName('');
      setDescription('');
      setTarget('');
      setTargetNumber('');
      setUnit('');
      setIcon('Flame');
      setXpReward('20');
      setIsActive(true);
    }
  }, [editingQuest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: editingQuest?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        target: target.trim() || (targetNumber ? `${targetNumber} ${unit}`.trim() : 'Selesai'),
        targetNumber: targetNumber ? parseFloat(targetNumber) : undefined,
        unit: unit.trim() || undefined,
        icon,
        xpReward: parseInt(xpReward, 10) || 10,
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
      title={editingQuest ? 'Edit Daily Quest' : 'Tambah Daily Quest Baru'}
      description="Konfigurasi aktivitas harian yang ingin kamu pantau secara konsisten."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Quest <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: 10.000 Langkah, Push Up, Membaca Buku"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deskripsi (Opsional)
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Petunjuk atau detail latihan"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Target & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Teks
            </label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="Contoh: 15 repetisi, 10.000 langkah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Satuan (Unit)
            </label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="repetisi, menit, langkah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Target Number & XP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Angka (Kuantitatif)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={targetNumber}
              onChange={e => setTargetNumber(e.target.value)}
              placeholder="Contoh: 10000 atau 15"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              XP Reward <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={xpReward}
              onChange={e => setXpReward(e.target.value)}
              placeholder="Contoh: 20"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Ikon Quest
          </label>
          <div className="grid grid-cols-6 gap-2 p-2 bg-slate-50 dark:bg-[#182030] rounded-xl border border-slate-200 dark:border-slate-700/60 max-h-36 overflow-y-auto">
            {AVAILABLE_ICONS.map(iName => (
              <button
                key={iName}
                type="button"
                onClick={() => setIcon(iName)}
                className={`p-2 rounded-lg flex items-center justify-center transition ${
                  icon === iName
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={iName}
              >
                <IconRenderer name={iName} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="questActiveCheckbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="questActiveCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Quest ini aktif dan tampil di daftar harian
          </label>
        </div>

        {/* Action Buttons */}
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
            {isSubmitting ? 'Menyimpan...' : editingQuest ? 'Simpan Perubahan' : 'Buat Quest'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
