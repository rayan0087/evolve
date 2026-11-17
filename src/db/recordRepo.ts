import { db } from './index';
import { DailyRecord, DailyNote, Quest } from '../lib/types';
import { getLocalDateKey } from '../lib/dateUtils';

/**
 * Gets or creates daily records for all active quests on a given dateKey.
 * Guarantees that active quests are ready to display with their snapshot.
 */
export async function getDailyRecordsForDate(
  dateKey: string = getLocalDateKey(),
  activeQuests: Quest[] = []
): Promise<DailyRecord[]> {
  const existingRecords = await db.daily_records.where('dateKey').equals(dateKey).toArray();
  const recordMap = new Map(existingRecords.map(r => [r.questId, r]));

  const recordsToReturn: DailyRecord[] = [];
  const recordsToInsert: DailyRecord[] = [];
  const now = new Date().toISOString();

  // Set of currently active quest IDs
  const activeQuestIds = new Set(activeQuests.map(q => q.id));

  // Automatically clean up any pending/uncompleted records for quests that were deleted or deactivated
  const recordsToDelete: string[] = [];
  for (const rec of existingRecords) {
    if (!activeQuestIds.has(rec.questId) && !rec.isCompleted) {
      recordsToDelete.push(rec.id);
    }
  }
  if (recordsToDelete.length > 0) {
    await db.daily_records.bulkDelete(recordsToDelete);
  }

  for (const quest of activeQuests) {
    const existing = recordMap.get(quest.id);
    if (existing) {
      recordsToReturn.push(existing);
    } else {
      // Create new pending record with current snapshot
      const newRecord: DailyRecord = {
        id: `rec-${dateKey}-${quest.id}`,
        dateKey,
        questId: quest.id,
        questNameSnapshot: quest.name,
        targetSnapshot: quest.target,
        unitSnapshot: quest.unit,
        xpSnapshot: quest.xpReward,
        isCompleted: false,
        actualValue: quest.targetNumber ? 0 : undefined,
        createdAt: now,
        updatedAt: now
      };
      recordsToInsert.push(newRecord);
      recordsToReturn.push(newRecord);
    }
  }

  if (recordsToInsert.length > 0) {
    await db.daily_records.bulkPut(recordsToInsert);
  }

  return recordsToReturn;
}

/**
 * Atomically toggle quest completion status.
 * Updates daily_records and adds/removes XP transaction in one transaction.
 */
export async function toggleQuestCompletion(
  recordId: string,
  actualValue?: number
): Promise<{ isCompleted: boolean; xpDelta: number }> {
  return await db.transaction('rw', [db.daily_records, db.xp_transactions], async () => {
    const record = await db.daily_records.get(recordId);
    if (!record) {
      throw new Error(`Record ${recordId} not found`);
    }

    const nextCompleted = !record.isCompleted;
    const now = new Date().toISOString();

    if (nextCompleted) {
      // Mark completed
      await db.daily_records.update(recordId, {
        isCompleted: true,
        completedAt: now,
        actualValue: actualValue !== undefined ? actualValue : record.actualValue,
        updatedAt: now
      });

      // Ensure no duplicate XP transaction
      const existingTx = await db.xp_transactions.where('dailyRecordId').equals(recordId).first();
      if (!existingTx) {
        await db.xp_transactions.add({
          id: 'xp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          dateKey: record.dateKey,
          questId: record.questId,
          dailyRecordId: record.id,
          amount: record.xpSnapshot,
          reason: `Quest selesai: ${record.questNameSnapshot}`,
          createdAt: now
        });
      }

      return { isCompleted: true, xpDelta: record.xpSnapshot };
    } else {
      // Mark uncompleted
      await db.daily_records.update(recordId, {
        isCompleted: false,
        completedAt: undefined,
        updatedAt: now
      });

      // Remove XP transaction
      await db.xp_transactions.where('dailyRecordId').equals(recordId).delete();

      return { isCompleted: false, xpDelta: -record.xpSnapshot };
    }
  });
}

/**
 * Updates actual value for quantitative targets (e.g. steps or reps)
 */
export async function updateActualValue(recordId: string, value: number): Promise<void> {
  const now = new Date().toISOString();
  await db.daily_records.update(recordId, {
    actualValue: value,
    updatedAt: now
  });
}

/**
 * Daily Notes CRUD
 */
export async function getDailyNote(dateKey: string): Promise<DailyNote | undefined> {
  return await db.daily_notes.where('dateKey').equals(dateKey).first();
}

export async function saveDailyNote(dateKey: string, noteText: string): Promise<void> {
  const existing = await db.daily_notes.where('dateKey').equals(dateKey).first();
  const now = new Date().toISOString();

  if (existing) {
    await db.daily_notes.update(existing.id, {
      note: noteText,
      updatedAt: now
    });
  } else {
    await db.daily_notes.add({
      id: `note-${dateKey}`,
      dateKey,
      note: noteText,
      createdAt: now,
      updatedAt: now
    });
  }
}
