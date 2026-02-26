import { getDB } from './db';
import { Flower } from '../types';

export async function createFlower(
  type: string,
  isBonus: boolean = false,
  earnedFromSessionId?: string,
  earnedFromConsecutivePomoId?: string
): Promise<Flower> {
  const db = await getDB();
  const flowerId = `flower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const flower: Flower = {
    flowerId,
    type,
    earnedAt: new Date(),
    isBonus,
    earnedFromSessionId,
    earnedFromConsecutivePomoId,
  };

  await db.add('flowers', flower);
  return flower;
}

export async function getFlower(flowerId: string): Promise<Flower | undefined> {
  const db = await getDB();
  return db.get('flowers', flowerId);
}

export async function getAllFlowers(): Promise<Flower[]> {
  const db = await getDB();
  return db.getAll('flowers');
}

export async function getFlowersByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Flower[]> {
  const db = await getDB();
  const index = db.transaction('flowers').store.index('by-earnedAt');
  const allFlowers = await index.getAll();
  
  return allFlowers.filter(
    (flower) => flower.earnedAt >= startDate && flower.earnedAt <= endDate
  );
}

export async function getBonusFlowers(): Promise<Flower[]> {
  const db = await getDB();
  const all = await db.getAll('flowers');
  return all.filter((f) => f.isBonus === true);
}

/** All earned flowers (for bouquet/share), sorted by earnedAt descending */
export async function getAllEarnedFlowers(): Promise<Flower[]> {
  const all = await getAllFlowers();
  return all.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
}

/** Create a flower earned from a completed session */
export async function earnFlowerFromSession(
  sessionId: string,
  flowerType: string,
  isBonus: boolean = false
): Promise<Flower> {
  return createFlower(flowerType, isBonus, sessionId);
}
