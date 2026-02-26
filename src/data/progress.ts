import { getDB } from './db';
import { Progress, DailyStat } from '../types';
import { getTodaySessions } from './sessions';

const PROGRESS_ID = 'main' as const;
type StoredProgress = Progress & { id: string };

export async function getProgress(): Promise<Progress> {
  const db = await getDB();
  let raw = await db.get('progress', PROGRESS_ID);
  if (!raw) {
    const initial: Progress = {
      consecutivePomos: 0,
      totalPomos: 0,
      wrapperEarned: false,
      dailyStats: [],
      streakActive: 0,
    };
    await db.add('progress', { id: PROGRESS_ID, ...initial } as StoredProgress);
    return initial;
  }
  const { id: _id, ...progress } = raw as StoredProgress;
  return progress;
}

export async function updateProgress(updates: Partial<Progress>): Promise<void> {
  const db = await getDB();
  const progress = await getProgress();
  await db.put('progress', { id: PROGRESS_ID, ...progress, ...updates } as StoredProgress);
}

export async function incrementConsecutivePomos(): Promise<number> {
  const progress = await getProgress();
  const newCount = progress.consecutivePomos + 1;
  await updateProgress({ consecutivePomos: newCount });
  return newCount;
}

export async function resetConsecutivePomos(): Promise<void> {
  await updateProgress({ consecutivePomos: 0 });
}

export async function incrementTotalPomos(): Promise<number> {
  const progress = await getProgress();
  const newTotal = progress.totalPomos + 1;
  await updateProgress({ totalPomos: newTotal });
  return newTotal;
}

export async function updateDailyStats(): Promise<void> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todaySessions = await getTodaySessions();
  
  const completedPomos = todaySessions.filter(
    (s) => s.type === 'pomo' && s.status === 'completed'
  );
  
  const focusMinutes = completedPomos.reduce((sum, s) => {
    if (s.endTime && s.startTime) {
      const diff = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60);
      return sum + Math.round(diff);
    }
    return sum;
  }, 0);
  
  const breakSessions = todaySessions.filter(
    (s) => (s.type === 'shortBreak' || s.type === 'longBreak') && s.status === 'completed'
  );
  
  const breakMinutes = breakSessions.reduce((sum, s) => {
    if (s.endTime && s.startTime) {
      const diff = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60);
      return sum + Math.round(diff);
    }
    return sum;
  }, 0);
  
  const progress = await getProgress();
  const dailyStats = [...progress.dailyStats];
  const todayIndex = dailyStats.findIndex((stat) => stat.date === todayStr);
  
  const todayStat: DailyStat = {
    date: todayStr,
    pomosCompleted: completedPomos.length,
    focusMinutes,
    breakMinutes,
  };
  
  if (todayIndex >= 0) {
    dailyStats[todayIndex] = todayStat;
  } else {
    dailyStats.push(todayStat);
  }
  
  await updateProgress({ dailyStats });
}

export async function updateStreak(): Promise<number> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const progress = await getProgress();
  const yesterdayStat = progress.dailyStats.find((stat) => stat.date === yesterdayStr);
  
  let newStreak = progress.streakActive;
  
  if (yesterdayStat && yesterdayStat.pomosCompleted >= 1) {
    // Continue streak
    newStreak = progress.streakActive + 1;
  } else {
    // Reset streak
    newStreak = 1;
  }
  
  await updateProgress({ streakActive: newStreak });
  return newStreak;
}

export async function getTodayStats(): Promise<DailyStat | null> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const progress = await getProgress();
  return progress.dailyStats.find((stat) => stat.date === todayStr) || null;
}

/** Today's progress for Progress screen: { pomodorosCompleted, totalFocusMinutes, currentStreak } */
export async function getTodayProgress(): Promise<{
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  currentStreak: number;
}> {
  const stat = await getTodayStats();
  const progress = await getProgress();
  return {
    pomodorosCompleted: stat?.pomosCompleted ?? 0,
    totalFocusMinutes: stat?.focusMinutes ?? 0,
    currentStreak: progress.streakActive,
  };
}

/** Overall progress for Progress/Share: { totalPomodoros, totalFocusMinutes } */
export async function getOverallProgress(): Promise<{
  totalPomodoros: number;
  totalFocusMinutes: number;
}> {
  const progress = await getProgress();
  const totalFocusMinutes = progress.dailyStats.reduce((s, d) => s + d.focusMinutes, 0);
  return {
    totalPomodoros: progress.totalPomos,
    totalFocusMinutes,
  };
}
