import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, FileText, CheckCircle2 } from 'lucide-react';
import { db } from '../db/index';
import { getActiveQuests } from '../db/questRepo';
import { getDailyRecordsForDate, toggleQuestCompletion, updateActualValue } from '../db/recordRepo';
import { getEnrichedActiveRewards, claimReward, EnrichedReward } from '../db/rewardRepo';
import { getUserProgression } from '../db/statsRepo';
import { getLocalDateKey } from '../lib/dateUtils';
import { Quest, DailyRecord } from '../lib/types';
import { DailyProgressCard } from '../components/dashboard/DailyProgressCard';
import { QuestItemCard } from '../components/dashboard/QuestItemCard';
import { NextRewardCard } from '../components/dashboard/NextRewardCard';
import { LevelSummaryCard } from '../components/dashboard/LevelSummaryCard';
import { DailyNoteModal } from '../components/dashboard/DailyNoteModal';
import { RewardCelebrationModal } from '../components/rewards/RewardCelebrationModal';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const todayKey = getLocalDateKey();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [enrichedRewards, setEnrichedRewards] = useState<EnrichedReward[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [celebratingReward, setCelebratingReward] = useState<EnrichedReward | null>(null);
  const [progression, setProgression] = useState<Awaited<ReturnType<typeof getUserProgression>> | null>(null);

  // Live queries so any DB update reacts immediately
  const liveRecords = useLiveQuery(() => db.daily_records.where('dateKey').equals(todayKey).toArray(), [todayKey]);
  const liveXpTx = useLiveQuery(() => db.xp_transactions.toArray());
  const liveQuests = useLiveQuery(() => db.quests.filter(q => q.isActive && !q.archivedAt).toArray());

  // Reload data
  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      const quests = await getActiveQuests();
      if (!isMounted) return;
      setActiveQuests(quests);

      const recs = await getDailyRecordsForDate(todayKey, quests);
      if (!isMounted) return;
      setDailyRecords(recs);

      const rewards = await getEnrichedActiveRewards();
      if (!isMounted) return;
      setEnrichedRewards(rewards);

      const prog = await getUserProgression();
      if (!isMounted) return;
      setProgression(prog);
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [liveRecords, liveXpTx, liveQuests, todayKey]);

  // Handle toggling quest
  const handleToggleQuest = async (recordId: string, actualValue?: number) => {
    await toggleQuestCompletion(recordId, actualValue);
  };

  const handleUpdateActualValue = async (recordId: string, value: number) => {
    await updateActualValue(recordId, value);
  };

  const handleClaimReward = async (rewardId: string) => {
    const targetReward = enrichedRewards.find(r => r.reward.id === rewardId);
    if (targetReward) {
      setCelebratingReward(targetReward);
    }
  };

  const handleConfirmClaimReward = async (rewardId: string, periodStart: string) => {
    await claimReward(rewardId, periodStart);
    const updated = await getEnrichedActiveRewards();
    setEnrichedRewards(updated);
  };

  // Find next closest reward to display on dashboard
  const nextReward = enrichedRewards.find(r => r.status === 'unlocked') || enrichedRewards[0];

  const questMap = new Map(activeQuests.map(q => [q.id, q]));
  const completedCount = dailyRecords.filter(r => r.isCompleted).length;
  const totalCount = activeQuests.length;
  const todayXp = dailyRecords.filter(r => r.isCompleted).reduce((sum, r) => sum + (r.xpSnapshot || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Today's Progress Card */}
      <DailyProgressCard
        completedCount={completedCount}
        totalCount={totalCount}
        todayXp={todayXp}
      />

      {/* Main Quests Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Daily Quests Hari Ini
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selesaikan quest harianmu untuk mengumpulkan XP dan menjaga konsistensi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#182030] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition flex items-center gap-1.5 shadow-sm"
              title="Catatan / Refleksi Hari Ini"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Catatan Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigateTab('quests')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kelola Quest</span>
            </button>
          </div>
        </div>

        {dailyRecords.length === 0 ? (
          <div className="bg-white dark:bg-[#121824] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Belum Ada Quest Aktif
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Mulai harimu dengan menambahkan quest baru di halaman Kelola Quest.
            </p>
            <button
              onClick={() => onNavigateTab('quests')}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition"
            >
              + Tambah Quest Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyRecords.map(record => {
              const quest = questMap.get(record.questId);
              return (
                <QuestItemCard
                  key={record.id}
                  record={record}
                  icon={quest?.icon || 'Flame'}
                  targetNumber={quest?.targetNumber}
                  onToggle={handleToggleQuest}
                  onUpdateActualValue={handleUpdateActualValue}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Grid: Next Reward & Hero Level Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NextRewardCard
          reward={nextReward}
          onNavigateToRewards={() => onNavigateTab('rewards')}
          onClaim={handleClaimReward}
        />

        {progression && (
          <LevelSummaryCard levelInfo={progression.levelInfo} />
        )}
      </div>

      {/* Modals */}
      {showNoteModal && (
        <DailyNoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          dateKey={todayKey}
        />
      )}

      {celebratingReward && (
        <RewardCelebrationModal
          isOpen={!!celebratingReward}
          onClose={() => setCelebratingReward(null)}
          reward={celebratingReward}
          onConfirmClaim={handleConfirmClaimReward}
        />
      )}
    </div>
  );
};
