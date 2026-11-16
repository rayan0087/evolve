import { db } from './index';
import { Quest } from '../lib/types';
import { INITIAL_QUESTS } from './seeds';

/**
 * Ensures initial default quests exist on first startup
 */
export async function seedInitialQuestsIfEmpty(): Promise<void> {
  const count = await db.quests.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const questsToInsert: Quest[] = INITIAL_QUESTS.map(q => ({
      ...q,
      createdAt: now,
      updatedAt: now
    }));
    await db.quests.bulkAdd(questsToInsert);
  }
}

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
  await db.quests.update(id, {
    ...updates,
    updatedAt: now
  });
}

/**
 * Archives a quest (soft delete so past records retain consistency)
 */
export async function archiveQuest(id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.quests.update(id, {
    isActive: false,
    archivedAt: now,
    updatedAt: now
  });
}

/**
 * Permanently deletes a quest (used in manage quest if desired)
 */
export async function deleteQuest(id: string): Promise<void> {
  await db.quests.delete(id);
}
