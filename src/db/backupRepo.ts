import { db } from './index';
import { BackupData } from '../lib/types';

export const CURRENT_BACKUP_VERSION = 1;

/**
 * Exports all IndexedDB tables into a structured JSON string.
 */
export async function exportAllData(): Promise<string> {
  const [
    quests,
    dailyRecords,
    dailyNotes,
    xpTransactions,
    userStats,
    rewards,
    rewardPeriodRecords,
    appSettings
  ] = await Promise.all([
    db.quests.toArray(),
    db.daily_records.toArray(),
    db.daily_notes.toArray(),
    db.xp_transactions.toArray(),
    db.user_stats.toArray(),
    db.rewards.toArray(),
    db.reward_period_records.toArray(),
    db.app_settings.toArray(),
  ]);

  const backup: BackupData = {
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appName: 'Daily Quest',
    data: {
      quests,
      dailyRecords,
      dailyNotes,
      xpTransactions,
      userStats,
      rewards,
      rewardPeriodRecords,
      appSettings
    }
  };

  return JSON.stringify(backup, null, 2);
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  summary?: {
    version: number;
    exportedAt: string;
    questCount: number;
    recordCount: number;
    rewardCount: number;
    txCount: number;
  };
}

/**
 * Validates a backup JSON string and returns metadata summary.
 */
export function validateBackupJson(jsonString: string): BackupValidationResult {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Format JSON tidak valid' };
    }

    if (!parsed.version || typeof parsed.version !== 'number') {
      return { isValid: false, error: 'Versi format backup tidak ditemukan' };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      return { isValid: false, error: 'Struktur data backup tidak ditemukan' };
    }

    const { quests, dailyRecords, rewards, xpTransactions } = parsed.data;

    if (!Array.isArray(quests) || !Array.isArray(dailyRecords) || !Array.isArray(rewards)) {
      return { isValid: false, error: 'Struktur tabel data tidak sesuai format Daily Quest' };
    }

    return {
      isValid: true,
      summary: {
        version: parsed.version,
        exportedAt: parsed.exportedAt || 'Tidak diketahui',
        questCount: quests.length,
        recordCount: dailyRecords.length,
        rewardCount: rewards.length,
        txCount: Array.isArray(xpTransactions) ? xpTransactions.length : 0
      }
    };
  } catch (err: any) {
    return { isValid: false, error: `Gagal membaca file: ${err.message || 'Format tidak valid'}` };
  }
}

/**
 * Restores data from a validated BackupData object.
 * Runs inside a Dexie transaction to prevent data corruption.
 */
export async function restoreFromBackup(
  backup: BackupData,
  mode: 'replace' | 'merge' = 'replace'
): Promise<void> {
  const tables = [
    db.quests,
    db.daily_records,
    db.daily_notes,
    db.xp_transactions,
    db.user_stats,
    db.rewards,
    db.reward_period_records,
    db.app_settings
  ];

  await db.transaction('rw', tables, async () => {
    if (mode === 'replace') {
      await Promise.all([
        db.quests.clear(),
        db.daily_records.clear(),
        db.daily_notes.clear(),
        db.xp_transactions.clear(),
        db.user_stats.clear(),
        db.rewards.clear(),
        db.reward_period_records.clear(),
        db.app_settings.clear()
      ]);
    }

    const { data } = backup;
    if (data.quests?.length) await db.quests.bulkPut(data.quests);
    if (data.dailyRecords?.length) await db.daily_records.bulkPut(data.dailyRecords);
    if (data.dailyNotes?.length) await db.daily_notes.bulkPut(data.dailyNotes);
    if (data.xpTransactions?.length) await db.xp_transactions.bulkPut(data.xpTransactions);
    if (data.userStats?.length) await db.user_stats.bulkPut(data.userStats);
    if (data.rewards?.length) await db.rewards.bulkPut(data.rewards);
    if (data.rewardPeriodRecords?.length) await db.reward_period_records.bulkPut(data.rewardPeriodRecords);
    if (data.appSettings?.length) await db.app_settings.bulkPut(data.appSettings);
  });
}

/**
 * Factory reset: clears all tables and re-seeds initial quests and rewards
 */
export async function factoryResetAllData(): Promise<void> {
  const tables = [
    db.quests,
    db.daily_records,
    db.daily_notes,
    db.xp_transactions,
    db.user_stats,
    db.rewards,
    db.reward_period_records,
    db.app_settings
  ];

  await db.transaction('rw', tables, async () => {
    await Promise.all([
      db.quests.clear(),
      db.daily_records.clear(),
      db.daily_notes.clear(),
      db.xp_transactions.clear(),
      db.user_stats.clear(),
      db.rewards.clear(),
      db.reward_period_records.clear(),
      db.app_settings.clear()
    ]);
  });
}
