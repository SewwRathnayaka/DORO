// src/data/consecutive.ts
// Consecutive Pomodoro operations

import { getDB } from './db';
import type { ConsecutivePomo, ConsecutivePomoStatus, BonusItem } from '../types/index';

/**
 * Create a new consecutive pomo group
 */
export async function createConsecutivePomo(sessionIds: string[]): Promise<ConsecutivePomo> {
  const db = await getDB();
  const consecutivePomoId = `consecutive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const consecutivePomo: ConsecutivePomo = {
    consecutivePomoId,
    sessionIds,
    status: 'active',
  };

  await db.add('consecutivePomos', consecutivePomo);
  return consecutivePomo;
}

/**
 * Get a consecutive pomo by ID
 */
export async function getConsecutivePomo(consecutivePomoId: string): Promise<ConsecutivePomo | undefined> {
  const db = await getDB();
  return db.get('consecutivePomos', consecutivePomoId);
}

/**
 * Update consecutive pomo status
 */
export async function updateConsecutivePomoStatus(
  consecutivePomoId: string,
  status: ConsecutivePomoStatus
): Promise<void> {
  const db = await getDB();
  const consecutivePomo = await db.get('consecutivePomos', consecutivePomoId);
  if (consecutivePomo) {
    await db.put('consecutivePomos', { ...consecutivePomo, status });
  }
}

/**
 * Add bonus item to consecutive pomo
 */
export async function addBonusItem(
  consecutivePomoId: string,
  bonusItem: BonusItem
): Promise<void> {
  const db = await getDB();
  const consecutivePomo = await db.get('consecutivePomos', consecutivePomoId);
  if (consecutivePomo) {
    await db.put('consecutivePomos', { ...consecutivePomo, bonusItem });
  }
}

/**
 * Get active consecutive pomo
 */
export async function getActiveConsecutivePomo(): Promise<ConsecutivePomo | undefined> {
  const db = await getDB();
  const all = await db.getAll('consecutivePomos');
  return all.find(cp => cp.status === 'active');
}
