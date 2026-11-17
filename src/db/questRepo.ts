import { db } from './index';
import { Quest } from '../lib/types';

/**
 * Returns all active (non-archived) quests sorted by order
 */
export async function getActiveQuests(): Promise<Quest[]> {
  return await db.quests
    .filter(q => q.isActive && !q.archivedAt)
    .sortBy('order');
}

/**
 * Returns all quests including inactive/archived
 */
export async function getAllQuests(): Promise<Quest[]> {
  return await db.quests.toCollection().sortBy('order');
}

/**
 * Creates a new quest
 */
export async function createQuest(
  questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { order?: number }
): Promise<Quest> {
  const count = await db.quests.count();
  const now = new Date().toISOString();
  const id = 'quest-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

  const newQuest: Quest = {
    ...questData,
    id,
    order: questData.order ?? count + 1,
    createdAt: now,
    updatedAt: now
  };

  await db.quests.add(newQuest);
  return newQuest;
}

/**
 * Updates an existing quest
 */
export async function updateQuest(id: string, updates: Partial<Quest>): Promise<void> {
  const now = new Date().toISOString();
  await db.transaction('rw', [db.quests, db.daily_records], async () => {
    await db.quests.update(id, {
      ...updates,
      updatedAt: now
    });
    if (updates.isActive === false) {
      const uncompleted = await db.daily_records
        .where('questId')
        .equals(id)
        .filter(r => !r.isCompleted)
        .toArray();
      if (uncompleted.length > 0) {
        await db.daily_records.bulkDelete(uncompleted.map(r => r.id));
      }
    }
  });
}

/**
 * Archives a quest (soft delete so past records retain consistency)
 */
export async function archiveQuest(id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.transaction('rw', [db.quests, db.daily_records], async () => {
    await db.quests.update(id, {
      isActive: false,
      archivedAt: now,
      updatedAt: now
    });
    // Remove uncompleted daily records for this quest so it immediately leaves the dashboard
    const uncompleted = await db.daily_records
      .where('questId')
      .equals(id)
      .filter(r => !r.isCompleted)
      .toArray();
    if (uncompleted.length > 0) {
      await db.daily_records.bulkDelete(uncompleted.map(r => r.id));
    }
  });
}

/**
 * Permanently deletes a quest (used in manage quest)
 */
export async function deleteQuest(id: string): Promise<void> {
  await db.transaction('rw', [db.quests, db.daily_records], async () => {
    await db.quests.delete(id);
    // Remove uncompleted daily records for this deleted quest
    const uncompleted = await db.daily_records
      .where('questId')
      .equals(id)
      .filter(r => !r.isCompleted)
      .toArray();
    if (uncompleted.length > 0) {
      await db.daily_records.bulkDelete(uncompleted.map(r => r.id));
    }
  });
}
