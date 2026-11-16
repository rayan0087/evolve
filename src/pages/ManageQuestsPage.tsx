import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit2, Archive, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { getAllQuests, createQuest, updateQuest, archiveQuest, deleteQuest } from '../db/questRepo';
import { Quest } from '../lib/types';
import { IconRenderer } from '../components/common/IconRenderer';
import { QuestFormModal } from '../components/quests/QuestFormModal';

export const ManageQuestsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const quests = useLiveQuery(() => getAllQuests(), []) || [];

  const handleOpenCreate = () => {
    setEditingQuest(null);
    setShowModal(true);
  };

  const handleOpenEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setShowModal(true);
  };

  const handleToggleActive = async (quest: Quest) => {
    await updateQuest(quest.id, { isActive: !quest.isActive });
  };

  const handleArchive = async (id: string) => {
    await archiveQuest(id);
  };

  const handleDelete = async (id: string) => {
    await deleteQuest(id);
    setDeleteConfirmId(null);
  };

  const handleSaveQuest = async (
    questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { id?: string }
  ) => {
    if (questData.id) {
      await updateQuest(questData.id, questData);
    } else {
      await createQuest(questData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Kelola Daily Quests
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tambah, edit, atau sesuaikan target dan reward XP untuk setiap quest harianmu
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Tambah Quest Baru
        </button>
      </div>

      {/* Info Notice about Past Snapshots */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
        <div>
          <span className="font-bold">Keamanan Histori Data:</span> Mengubah target atau XP di sini tidak akan merusak catatan masa lalu. Setiap catatan harian menyimpan snapshot permanen saat diselesaikan.
        </div>
      </div>

      {/* Quests Table / List */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {quests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Belum ada quest. Klik "Tambah Quest Baru" untuk memulai!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {quests.map(quest => (
              <div
                key={quest.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      quest.isActive && !quest.archivedAt
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <IconRenderer name={quest.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold truncate ${quest.archivedAt ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {quest.name}
                      </h3>
                      {quest.archivedAt && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Diarsipkan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{quest.target}</span>
                      {quest.description && ` • ${quest.description}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* XP Reward Badge */}
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                    +{quest.xpReward} XP
                  </span>

                  {/* Active Toggle Button */}
                  <button
                    onClick={() => handleToggleActive(quest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      quest.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={quest.isActive ? 'Nonaktifkan Quest' : 'Aktifkan Quest'}
                  >
                    {quest.isActive ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                    <span>{quest.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(quest)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Quest"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!quest.archivedAt && (
                      <button
                        onClick={() => handleArchive(quest.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Arsipkan Quest"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(quest.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Hapus Quest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hapus Quest Ini?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Quest akan dihapus dari daftar. Catatan harian yang sudah pernah tersimpan sebelumnya akan tetap dipertahankan.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Form Modal */}
      {showModal && (
        <QuestFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSaveQuest}
          editingQuest={editingQuest}
        />
      )}
    </div>
  );
};
