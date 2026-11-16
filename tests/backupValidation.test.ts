import { describe, it, expect } from 'vitest';
import { validateBackupJson } from '../src/db/backupRepo';

describe('backupValidation', () => {
  it('validates genuine backup json structure', () => {
    const validJson = JSON.stringify({
      version: 1,
      exportedAt: '2026-11-16T12:00:00Z',
      appName: 'Daily Quest',
      data: {
        quests: [{ id: 'q1', name: 'Test', target: '10', icon: 'Flame', xpReward: 20, isActive: true, order: 1 }],
        dailyRecords: [{ id: 'r1', dateKey: '2026-11-16', questId: 'q1', isCompleted: true }],
        dailyNotes: [],
        xpTransactions: [{ id: 'x1', dateKey: '2026-11-16', amount: 20, reason: 'Test' }],
        userStats: [],
        rewards: [{ id: 'rw1', name: 'Coffee', periodType: 'weekly', targetXp: 500, isActive: true }],
        rewardPeriodRecords: [],
        appSettings: []
      }
    });

    const res = validateBackupJson(validJson);
    expect(res.isValid).toBe(true);
    expect(res.summary?.questCount).toBe(1);
    expect(res.summary?.recordCount).toBe(1);
    expect(res.summary?.rewardCount).toBe(1);
    expect(res.summary?.txCount).toBe(1);
  });

  it('rejects invalid JSON string or corrupted schema', () => {
    expect(validateBackupJson('{invalid json').isValid).toBe(false);
    expect(validateBackupJson(JSON.stringify({ notData: true })).isValid).toBe(false);
    expect(validateBackupJson(JSON.stringify({ version: 1, data: {} })).isValid).toBe(false);
  });
});
