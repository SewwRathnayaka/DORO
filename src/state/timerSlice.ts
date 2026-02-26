// src/state/timerSlice.ts
// Timer + streak + consecutive logic state

export interface TimerState {
  timerRunning: boolean;
  timerPaused: boolean;
  timeRemaining: number; // in seconds
  timerType: 'pomo' | 'break';
  consecutiveCount: number;
}

export interface TimerActions {
  startTimer: (duration: number, type: 'pomo' | 'break') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setTimeRemaining: (time: number) => void;
  incrementConsecutive: () => void;
  resetConsecutive: () => void;
}

// This is a type definition file - actual implementation is in store.ts
