import React, { useState } from 'react';
import { Check, Edit3, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import clsx from 'clsx';
import { DailyRecord } from '../../lib/types';
import { IconRenderer } from '../common/IconRenderer';
import { Modal } from '../common/Modal';

interface QuestItemCardProps {
  record: DailyRecord;
  icon: string;
  targetNumber?: number;
  onToggle: (recordId: string, actualValue?: number) => Promise<void>;
  onUpdateActualValue: (recordId: string, value: number) => Promise<void>;
}

export const QuestItemCard: React.FC<QuestItemCardProps> = ({
  record,
  icon,
  targetNumber,
  onToggle,
  onUpdateActualValue
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showValModal, setShowValModal] = useState(false);
  const [inputValue, setInputValue] = useState(record.actualValue?.toString() || '0');

  const handleCheckboxClick = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if (!record.isCompleted) {
        // Trigger light confetti celebration!
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#0EA5E9', '#F59E0B']
        });
      }
      await onToggle(record.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      await onUpdateActualValue(record.id, val);
      // Auto complete if reached target
      if (targetNumber && val >= targetNumber && !record.isCompleted) {
        await onToggle(record.id, val);
      }
    }
    setShowValModal(false);
  };

  return (
    <>
      <div
        className={clsx(
          'group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200',
          record.isCompleted
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/30'
            : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Checkbox Button */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isUpdating}
            className={clsx(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
              record.isCompleted
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/60'
            )}
            aria-label={record.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            {record.isCompleted && <Check className="w-5 h-5 stroke-[3]" />}
          </button>

          {/* Icon Badge */}
          <div
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
              record.isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
          >
            <IconRenderer name={icon} className="w-5 h-5" />
          </div>

          {/* Quest Title & Target Details */}
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5">
              <h3
                className={clsx(
                  'text-sm font-bold truncate transition-colors',
                  record.isCompleted
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-white'
                )}
              >
                {record.questNameSnapshot}
              </h3>
              {record.isCompleted && (
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Target: {record.targetSnapshot}
              </span>
              {record.actualValue !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Aktual: {record.actualValue} {record.unitSnapshot || ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actual Value Edit Button + XP Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {targetNumber && targetNumber > 1 && (
            <button
              onClick={() => {
                setInputValue(record.actualValue?.toString() || '0');
                setShowValModal(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
              title="Input nilai aktual"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Input</span>
            </button>
          )}

          <div
            className={clsx(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-colors',
              record.isCompleted
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
            )}
          >
            +{record.xpSnapshot} XP
          </div>
        </div>
      </div>

      {/* Input Actual Value Modal */}
      {showValModal && (
        <Modal
          isOpen={showValModal}
          onClose={() => setShowValModal(false)}
          title={`Input Nilai Aktual: ${record.questNameSnapshot}`}
          description={`Target: ${record.targetSnapshot}`}
        >
          <form onSubmit={handleSaveValue} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nilai yang telah dicapai ({record.unitSnapshot || 'unit'})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowValModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
