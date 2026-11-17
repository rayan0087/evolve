import { db } from './index';
import { Reward, RewardPeriodRecord, RewardStatus } from '../lib/types';
import { getPeriodBounds, getLocalDateKey } from '../lib/dateUtils';
import { getXpForPeriod } from './xpRepo';

/**
 * Rewards CRUD
 */
export async function getAllRewards(): Promise<Reward[]> {
  return await db.rewards.toArray();
}

export async function getActiveRewards(): Promise<Reward[]> {
  return await db.rewards.filter(r => r.isActive).toArray();
}

export async function createReward(
  rewardData: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reward> {
  const now = new Date().toISOString();
  const id = 'reward-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const newReward: Reward = {
    ...rewardData,
    id,
    createdAt: now,
    updatedAt: now
  };
  await db.rewards.add(newReward);
  return newReward;
}

export async function updateReward(id: string, updates: Partial<Reward>): Promise<void> {
  const now = new Date().toISOString();
  await db.rewards.update(id, {
    ...updates,
    updatedAt: now
  });
}

export async function deleteReward(id: string): Promise<void> {
  await db.rewards.delete(id);
}

export interface EnrichedReward {
  reward: Reward;
  periodRecord?: RewardPeriodRecord;
  periodBounds: { start: string; end: string; label: string };
  earnedXp: number;
  progressPercent: number;
  remainingXp: number;
  status: RewardStatus;
  isUnlocked: boolean;
  isClaimed: boolean;
}

/**
 * Calculates current status and progress for all active rewards for the current calendar period.
 */
export async function getEnrichedActiveRewards(refDate: Date = new Date()): Promise<EnrichedReward[]> {
  const activeRewards = await getActiveRewards();
  const todayKey = getLocalDateKey(refDate);

  const results: EnrichedReward[] = [];

  for (const reward of activeRewards) {
    const bounds = getPeriodBounds(reward.periodType, refDate);
    const earnedXp = await getXpForPeriod(bounds.start, bounds.end);

    // Look for existing period record (to check if already unlocked or claimed)
    let periodRecord = await db.reward_period_records
      .where('[rewardId+periodStart]')
      .equals([reward.id, bounds.start])
      .first();

    const targetXp = periodRecord ? periodRecord.targetXpSnapshot : reward.targetXp;
    let status: RewardStatus = 'in_progress';
    const isTargetReached = earnedXp >= targetXp;
    const now = new Date().toISOString();

    if (periodRecord && periodRecord.status === 'claimed') {
      status = 'claimed';
    } else if (isTargetReached) {
      status = 'unlocked';
      // If not yet persisted as unlocked, persist it
      if (!periodRecord) {
        periodRecord = {
          id: `rpr-${reward.id}-${bounds.start}`,
          rewardId: reward.id,
          rewardNameSnapshot: reward.name,
          rewardDescriptionSnapshot: reward.description,
          periodType: reward.periodType,
          periodStart: bounds.start,
          periodEnd: bounds.end,
          targetXpSnapshot: targetXp,
          earnedXp,
          status: 'unlocked',
          unlockedAt: now,
          createdAt: now,
          updatedAt: now
        };
        await db.reward_period_records.add(periodRecord);
      } else if (periodRecord.status !== 'unlocked') {
        periodRecord.status = 'unlocked';
        periodRecord.unlockedAt = periodRecord.unlockedAt || now;
        periodRecord.earnedXp = earnedXp;
        periodRecord.updatedAt = now;
        await db.reward_period_records.put(periodRecord);
      }
    } else {
      // In progress or locked
      status = earnedXp === 0 ? 'locked' : 'in_progress';
      // If period ended in past and target not reached, it's expired
      if (todayKey > bounds.end) {
        status = 'expired';
      }
    }

    const progressPercent = Math.min(100, Math.max(0, Math.round((earnedXp / targetXp) * 100)));
    const remainingXp = Math.max(0, targetXp - earnedXp);

    results.push({
      reward,
      periodRecord,
      periodBounds: bounds,
      earnedXp,
      progressPercent,
      remainingXp,
      status,
      isUnlocked: status === 'unlocked',
      isClaimed: status === 'claimed'
    });
  }

  return results;
}

/**
 * Claims an unlocked reward.
 * Sets status to 'claimed', records claimedAt date.
 * Strictly prevents double claim and does NOT deduct XP.
 */
export async function claimReward(
  rewardId: string,
  periodStart: string
): Promise<RewardPeriodRecord> {
  const now = new Date().toISOString();

  return await db.transaction('rw', [db.rewards, db.reward_period_records, db.xp_transactions], async () => {
    let periodRecord = await db.reward_period_records
      .where('[rewardId+periodStart]')
      .equals([rewardId, periodStart])
      .first();

    const reward = await db.rewards.get(rewardId);
    if (!reward) throw new Error('Reward tidak ditemukan');

    const bounds = getPeriodBounds(reward.periodType, new Date());
    const earnedXp = await getXpForPeriod(periodStart, bounds.end);

    if (periodRecord && periodRecord.status === 'claimed') {
      throw new Error('Reward ini sudah diklaim sebelumnya');
    }

    if (periodRecord) {
      periodRecord.status = 'claimed';
      periodRecord.claimedAt = now;
      periodRecord.earnedXp = earnedXp;
      periodRecord.updatedAt = now;
      await db.reward_period_records.put(periodRecord);
      return periodRecord;
    } else {
      // Create record as claimed directly
      const newRecord: RewardPeriodRecord = {
        id: `rpr-${reward.id}-${periodStart}`,
        rewardId: reward.id,
        rewardNameSnapshot: reward.name,
        rewardDescriptionSnapshot: reward.description,
        periodType: reward.periodType,
        periodStart,
        periodEnd: bounds.end,
        targetXpSnapshot: reward.targetXp,
        earnedXp,
        status: 'claimed',
        unlockedAt: now,
        claimedAt: now,
        createdAt: now,
        updatedAt: now
      };
      await db.reward_period_records.add(newRecord);
      return newRecord;
    }
  });
}

/**
 * Retrieves full historical records of claimed or unlocked rewards
 */
export async function getRewardHistory(): Promise<RewardPeriodRecord[]> {
  return await db.reward_period_records
    .reverse()
    .sortBy('createdAt');
}
