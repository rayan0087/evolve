import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { getDailyNote, saveDailyNote } from '../../db/recordRepo';
import { formatDisplayDate } from '../../lib/dateUtils';

interface DailyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
}

export const DailyNoteModal: React.FC<DailyNoteModalProps> = ({
  isOpen,
  onClose,
  dateKey
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && dateKey) {
      getDailyNote(dateKey).then(record => {
        setNoteText(record?.note || '');
      });
    }
  }, [isOpen, dateKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveDailyNote(dateKey, noteText);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catatan Harian"
      description={`Refleksi untuk ${formatDisplayDate(dateKey)}`}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <textarea
            rows={5}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Tuliskan catatan latihan, pola makan, atau refleksi harimu di sini..."
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182030] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
