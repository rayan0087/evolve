import Dexie, { type Table } from 'dexie';
import type {
  Quest,
  DailyRecord,
  DailyNote,
  XpTransaction,
  UserStats,
  Reward,
  RewardPeriodRecord,
  AppSetting
} from '../lib/types';

export class DailyQuestDatabase extends Dexie {
  quests!: Table<Quest, string>;
  daily_records!: Table<DailyRecord, string>;
  daily_notes!: Table<DailyNote, string>;
  xp_transactions!: Table<XpTransaction, string>;
  user_stats!: Table<UserStats, string>;
  rewards!: Table<Reward, string>;
  reward_period_records!: Table<RewardPeriodRecord, string>;
  app_settings!: Table<AppSetting, string>;

  constructor() {
    super('DailyQuestDB');
    this.version(1).stores({
      quests: 'id, isActive, order, createdAt, archivedAt',
      daily_records: 'id, [dateKey+questId], dateKey, questId, isCompleted, createdAt',
      daily_notes: 'id, dateKey',
      xp_transactions: 'id, dateKey, questId, dailyRecordId, createdAt',
      user_stats: 'id',
      rewards: 'id, periodType, isActive, createdAt',
      reward_period_records: 'id, [rewardId+periodStart], rewardId, periodType, periodStart, periodEnd, status, createdAt',
      app_settings: 'key'
    });
  }
}

export const db = new DailyQuestDatabase();
