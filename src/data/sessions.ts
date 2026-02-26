import { getDB } from './db';
import { Session, SessionType } from '../types';

export async function createSession(
  type: SessionType,
  flowerType?: string
): Promise<Session> {
  const db = await getDB();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: Session = {
    sessionId,
    type,
    startTime: new Date(),
    endTime: null,
    status: 'paused', // Will be 'paused' when timer starts
    flowerType,
  };

  await db.add('sessions', session);
  return session;
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  const db = await getDB();
  return db.get('sessions', sessionId);
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<void> {
  const db = await getDB();
  const session = await db.get('sessions', sessionId);
  if (session) {
    await db.put('sessions', { ...session, ...updates });
  }
}

export async function completeSession(sessionId: string): Promise<void> {
  await updateSession(sessionId, {
    status: 'completed',
    endTime: new Date(),
  });
}

export async function quitSession(sessionId: string): Promise<void> {
  await updateSession(sessionId, {
    status: 'quit',
    endTime: new Date(),
  });
}

export async function resetSession(sessionId: string): Promise<void> {
  await updateSession(sessionId, {
    status: 'reset',
    endTime: new Date(),
  });
}

export async function getActiveSession(): Promise<Session | undefined> {
  const db = await getDB();
  const index = db.transaction('sessions').store.index('by-startTime');
  const sessions = await index.getAll();
  
  // Find the most recent session that's not completed, quit, or reset
  const activeSession = sessions
    .reverse()
    .find(
      (s) =>
        s.status === 'paused' || s.status === 'active'
    );
  
  return activeSession;
}

export async function getTodaySessions(): Promise<Session[]> {
  const db = await getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const allSessions = await db.getAll('sessions');
  return allSessions.filter(
    (session) =>
      session.startTime >= today && session.startTime < tomorrow
  );
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB();
  return db.getAll('sessions');
}
