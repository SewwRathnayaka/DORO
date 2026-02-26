import { openDB, IDBPDatabase } from 'idb';
import { Session, Flower, Bouquet, Progress, ConsecutivePomo, User } from '../types';

interface DoroDB {
  users: {
    key: string;
    value: User;
  };
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-type': Session['type']; 'by-startTime': Date };
  };
  flowers: {
    key: string;
    value: Flower;
    indexes: { 'by-earnedAt': Date; 'by-isBonus': boolean };
  };
  bouquets: {
    key: string;
    value: Bouquet;
  };
  progress: {
    key: string;
    value: Progress;
  };
  consecutivePomos: {
    key: string;
    value: ConsecutivePomo;
    indexes: { 'by-status': ConsecutivePomo['status'] };
  };
}

const DB_NAME = 'doro-db';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase<DoroDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DoroDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store (single user keyed by 'current_user')
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users');
      }

      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'sessionId',
        });
        sessionStore.createIndex('by-type', 'type');
        sessionStore.createIndex('by-startTime', 'startTime');
      }

      // Flowers store
      if (!db.objectStoreNames.contains('flowers')) {
        const flowerStore = db.createObjectStore('flowers', {
          keyPath: 'flowerId',
        });
        flowerStore.createIndex('by-earnedAt', 'earnedAt');
        flowerStore.createIndex('by-isBonus', 'isBonus');
      }

      // Bouquets store
      if (!db.objectStoreNames.contains('bouquets')) {
        db.createObjectStore('bouquets', { keyPath: 'bouquetId' });
      }

      // Progress store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' });
      }

      // Consecutive Pomodoros store
      if (!db.objectStoreNames.contains('consecutivePomos')) {
        const consecutiveStore = db.createObjectStore('consecutivePomos', {
          keyPath: 'consecutivePomoId',
        });
        consecutiveStore.createIndex('by-status', 'status');
      }
    },
  });
  dbInstance = db as IDBPDatabase<DoroDB>;

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
