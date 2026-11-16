import React, { useState, useEffect } from 'react';
import { Check, X, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatDisplayDate } from '../../lib/dateUtils';
import { db } from '../../db/index';
import { DailyRecord } from '../../lib/types';
import { getDailyNote, saveDailyNote } from '../../db/recordRepo';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateKey
}) => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [dailyNote, setDailyNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && dateKey) {
      setLoading(true);
      Promise.all([
        db.daily_records.where('dateKey').equals(dateKey).toArray(),
        getDailyNote(dateKey)
      ]).then(([recs, noteRec]) => {
        setRecords(recs);
        setDailyNote(noteRec?.note || '');
        setNoteInput(noteRec?.note || '');
        setLoading(false);
      });
    }
  }, [isOpen, dateKey]);

  const handleSaveNote = async () => {
    await saveDailyNote(dateKey, noteInput);
    setDailyNote(noteInput);
    setIsEditingNote(false);
  };

  const completedCount = records.filter(r => r.isCompleted).length;
  const totalCount = records.length;
  const totalXp = records.filter(r => r.isCompleted).reduce((sum, r) => sum + (r.xpSnapshot || 0), 0);
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formatDisplayDate(dateKey)}
      description="Histori aktivitas dan catatan untuk hari ini"
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">Memuat data histori...</div>
      ) : (
        <div className="space-y-4">
          {/* Day Summary Stats Banner */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-[#182030] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Quest Selesai</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {completedCount} / {totalCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Completion</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {completionRate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total XP</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                +{totalXp} XP
              </span>
            </div>
          </div>

          {/* Quest Snapshot List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Daftar Quest & Snapshot
            </h4>

            {records.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Tidak ada catatan quest untuk tanggal ini.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {records.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#121824] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          r.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {r.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`font-semibold block truncate ${r.isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                          {r.questNameSnapshot}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Target: {r.targetSnapshot}
                          {r.actualValue !== undefined && ` • Aktual: ${r.actualValue} ${r.unitSnapshot || ''}`}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                      +{r.xpSnapshot} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Note Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Catatan Harian
              </span>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {dailyNote ? 'Edit' : '+ Tambah Catatan'}
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Tuliskan catatan harian..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteInput(dailyNote);
                      setIsEditingNote(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>
            ) : dailyNote ? (
              <p className="p-3 bg-slate-50 dark:bg-[#182030] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
                "{dailyNote}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada catatan untuk tanggal ini.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
