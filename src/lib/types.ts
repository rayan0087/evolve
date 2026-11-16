export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

export interface Quest {
  id: string;
  name: string;
  description?: string;
  target: string;
  targetNumber?: number;
  unit?: string;
  icon: string;
  xpReward: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface DailyRecord {
  id: string;
  dateKey: string; // YYYY-MM-DD (local)
  questId: string;
  questNameSnapshot: string;
  targetSnapshot: string;
  unitSnapshot?: string;
  xpSnapshot: number;
  isCompleted: boolean;
  completedAt?: string;
  actualValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNote {
  id: string;
  dateKey: string; // YYYY-MM-DD
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface XpTransaction {
  id: string;
  dateKey: string; // YYYY-MM-DD
  questId?: string;
  dailyRecordId?: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface UserStats {
  id: string; // 'main'
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  bestStreak: number;
  updatedAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  imageOrEmoji: string;
  periodType: PeriodType;
  targetXp: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RewardStatus = 'locked' | 'in_progress' | 'unlocked' | 'claimed' | 'expired';

export interface RewardPeriodRecord {
  id: string;
  rewardId: string;
  rewardNameSnapshot: string;
  rewardDescriptionSnapshot?: string;
  periodType: PeriodType;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  targetXpSnapshot: number;
  earnedXp: number;
  status: RewardStatus;
  unlockedAt?: string;
  claimedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  appName: string;
  data: {
    quests: Quest[];
    dailyRecords: DailyRecord[];
    dailyNotes: DailyNote[];
    xpTransactions: XpTransaction[];
    userStats: UserStats[];
    rewards: Reward[];
    rewardPeriodRecords: RewardPeriodRecord[];
    appSettings: AppSetting[];
  };
}
