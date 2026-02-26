import { getDB } from './db';
import { Bouquet } from '../types';

const MAIN_BOUQUET_ID = 'main' as const;

/** Message shown when the user has no flowers in their bouquet yet. */
export const EMPTY_BOUQUET_MESSAGE =
  "Seems like you're yet to start your journey to make a flower bouquet. Complete Pomodoros to earn flowers!";

export async function getMainBouquet(): Promise<Bouquet> {
  const db = await getDB();
  let bouquet = await db.get('bouquets', MAIN_BOUQUET_ID);
  
  if (!bouquet) {
    // Create main bouquet if it doesn't exist
    bouquet = {
      bouquetId: MAIN_BOUQUET_ID,
      flowers: [],
      createdAt: new Date(),
    };
    await db.add('bouquets', bouquet);
  }
  
  return bouquet;
}

export async function addFlowerToBouquet(flowerId: string): Promise<void> {
  const db = await getDB();
  const bouquet = await getMainBouquet();
  
  bouquet.flowers.push(flowerId);
  await db.put('bouquets', bouquet);
}

export async function getBouquetFlowers(): Promise<string[]> {
  const bouquet = await getMainBouquet();
  return bouquet.flowers;
}
