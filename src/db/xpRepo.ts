import { db } from './index';
import { XpTransaction } from '../lib/types';

/**
 * Adds an XP transaction atomically
 */
export async function addXpTransaction(
  dateKey: string,
  amount: number,
  reason: string,
  questId?: string,
  dailyRecordId?: string
): Promise<XpTransaction> {
  const transaction: XpTransaction = {
    id: 'xp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    dateKey,
    questId,
    dailyRecordId,
    amount,
    reason,
    createdAt: new Date().toISOString()
  };

  await db.xp_transactions.add(transaction);
  return transaction;
}

/**
 * Removes XP transactions associated with a daily record (e.g. when unchecking)
 */
export async function removeXpTransactionsByDailyRecord(dailyRecordId: string): Promise<void> {
  await db.xp_transactions.where('dailyRecordId').equals(dailyRecordId).delete();
}

/**
 * Calculates total XP of all time
 */
export async function getTotalAllTimeXp(): Promise<number> {
  const allTx = await db.xp_transactions.toArray();
  return allTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

/**
 * Calculates XP earned on a specific dateKey
 */
export async function getXpForDate(dateKey: string): Promise<number> {
  const txs = await db.xp_transactions.where('dateKey').equals(dateKey).toArray();
  return txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

/**
 * Calculates XP earned between two dateKeys inclusive [startKey, endKey]
 * Used for period-based rewards (Weekly, Monthly, Quarterly, Semiannual, Yearly)
 */
export async function getXpForPeriod(startKey: string, endKey: string): Promise<number> {
  const txs = await db.xp_transactions
    .where('dateKey')
    .between(startKey, endKey, true, true)
    .toArray();
  return txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}
