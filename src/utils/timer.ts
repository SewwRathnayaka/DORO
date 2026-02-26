// Timer utility functions

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getTimeRemaining(
  startTime: Date,
  durationSeconds: number
): number {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const remaining = durationSeconds - elapsed;
  return Math.max(0, remaining);
}

export const TIMER_DURATIONS = {
  POMODORO: 25 * 60, // 25 minutes in seconds
  SHORT_BREAK: 5 * 60, // 5 minutes in seconds
  LONG_BREAK: 15 * 60, // 15 minutes in seconds
} as const;
