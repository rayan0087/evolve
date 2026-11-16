import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Gift, Sparkles, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { db } from '../db/index';
import {
  getEnrichedActiveRewards,
  createReward,
  updateReward,
  deleteReward,
  claimReward,
  getRewardHistory,
  EnrichedReward
} from '../db/rewardRepo';
import { Reward, RewardPeriodRecord } from '../lib/types';
import { RewardCard } from '../components/rewards/RewardCard';
import { RewardFormModal } from '../components/rewards/RewardFormModal';
import { RewardCelebrationModal } from '../components/rewards/RewardCelebrationModal';
import { formatDisplayDate } from '../lib/dateUtils';

type RewardTab = 'active' | 'unlocked' | 'history';

export const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RewardTab>('active');
  const [enrichedRewards, setEnrichedRewards] = useState<EnrichedReward[]>([]);
  const [historyRecords, setHistoryRecords] = useState<RewardPeriodRecord[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [celebratingReward, setCelebratingReward] = useState<EnrichedReward | null>(null);

  const liveRewards = useLiveQuery(() => db.rewards.toArray());
  const livePeriodRecords = useLiveQuery(() => db.reward_period_records.toArray());
  const liveXpTx = useLiveQuery(() => db.xp_transactions.toArray());

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const enriched = await getEnrichedActiveRewards();
      if (!isMounted) return;
      setEnrichedRewards(enriched);

      const hist = await getRewardHistory();
      if (!isMounted) return;
      setHistoryRecords(hist);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [liveRewards, livePeriodRecords, liveXpTx]);

  const handleCreateOpen = () => {
    setEditingReward(null);
    setShowFormModal(true);
  };

  const handleEditOpen = (reward: Reward) => {
    setEditingReward(reward);
    setShowFormModal(true);
  };

  const handleDelete = async (rewardId: string) => {
    if (window.confirm('Hapus reward ini? Histori pencapaian masa lalu tetap akan tersimpan.')) {
      await deleteReward(rewardId);
    }
  };

  const handleSaveReward = async (
    data: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (data.id) {
      await updateReward(data.id, data);
    } else {
      await createReward(data);
    }
  };

  const handleClaimClick = (rewardId: string) => {
    const target = enrichedRewards.find(r => r.reward.id === rewardId);
    if (target) {
      setCelebratingReward(target);
    }
  };

  const handleConfirmClaim = async (rewardId: string, periodStart: string) => {
    await claimReward(rewardId, periodStart);
    const enriched = await getEnrichedActiveRewards();
    setEnrichedRewards(enriched);
    const hist = await getRewardHistory();
    setHistoryRecords(hist);
  };

  const unlockedList = enrichedRewards.filter(r => r.isUnlocked);
  const inProgressList = enrichedRewards.filter(r => !r.isClaimed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Reward & Pencapaian
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Raih target XP di setiap periode untuk membuka hadiah nyata bagi dirimu
          </p>
        </div>

        <button
          onClick={handleCreateOpen}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Buat Reward Baru
        </button>
      </div>

      {/* Info Notice about Period XP vs All-time XP */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <span className="font-bold">Konsep XP Reward:</span> XP dihitung terpisah untuk setiap periode (Mingguan, Bulanan, Kuartalan, dsb). Mengklaim reward <b>tidak akan mengurangi total XP</b> ataupun level heromu!
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Active Rewards ({inProgressList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unlocked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'unlocked'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Siap Diklaim ({unlockedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Histori Klaim ({historyRecords.filter(h => h.status === 'claimed').length})</span>
        </button>
      </div>

      {/* Tab: Active Rewards */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {inProgressList.length === 0 ? (
            <div className="bg-white dark:bg-[#121824] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-400">
              Belum ada reward aktif. Klik "+ Buat Reward Baru" untuk membuat reward motivasi pertamamu!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressList.map(item => (
                <RewardCard
                  key={item.reward.id}
                  enrichedReward={item}
                  onClaim={handleClaimClick}
                  onEdit={handleEditOpen}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Unlocked Rewards */}
      {activeTab === 'unlocked' && (
        <div className="space-y-4">
          {unlockedList.length === 0 ? (
            <div className="bg-white dark:bg-[#121824] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center">
              <Sparkles className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Belum Ada Reward yang Terbuka
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Kumpulkan lebih banyak XP dari quest harian untuk mencapai target periode!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedList.map(item => (
                <RewardCard
                  key={item.reward.id}
                  enrichedReward={item}
                  onClaim={handleClaimClick}
                  onEdit={handleEditOpen}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {historyRecords.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              Belum ada histori reward yang pernah diklaim atau dicapai.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {historyRecords.map(rec => (
                <div key={rec.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rec.rewardNameSnapshot}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Target: {rec.targetXpSnapshot} XP • Terkumpul: {rec.earnedXp} XP ({rec.periodType})
                      </p>
                      {rec.claimedAt && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Diklaim pada: {formatDisplayDate(rec.claimedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                    Claimed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <RewardFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSaveReward}
          editingReward={editingReward}
        />
      )}

      {celebratingReward && (
        <RewardCelebrationModal
          isOpen={!!celebratingReward}
          onClose={() => setCelebratingReward(null)}
          reward={celebratingReward}
          onConfirmClaim={handleConfirmClaim}
        />
      )}
    </div>
  );
};
