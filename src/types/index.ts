// User Types
export interface User {
  userId: string;
  username: string;
  createdAt: Date;
  settings: {
    soundOn: boolean;
    audioSettings?: {
      soundsEnabled: boolean;
      musicEnabled: boolean;
      volume: number;
    };
  };
}

// Session Types
export type SessionType = 'pomo' | 'shortBreak' | 'longBreak';
export type SessionStatus = 'completed' | 'quit' | 'reset' | 'paused' | 'active';

export interface Session {
  sessionId: string;
  type: SessionType;
  startTime: Date;
  endTime: Date | null;
  status: SessionStatus;
  flowerType?: string; // Selected flower for pomo sessions
}

// Flower Types
export interface Flower {
  flowerId: string;
  type: string;
  earnedAt: Date;
  isBonus: boolean;
  earnedFromSessionId?: string;
  earnedFromConsecutivePomoId?: string;
}

/** Alias for flowers displayed in bouquet/share (same as Flower) */
export type EarnedFlower = Flower;

// Bouquet Types
export interface Bouquet {
  bouquetId: 'main'; // Always 'main'
  flowers: string[]; // Array of flowerIds
  createdAt: Date;
}

// Progress Types
export interface DailyStat {
  date: string; // YYYY-MM-DD
  pomosCompleted: number;
  focusMinutes: number;
  breakMinutes: number;
}

export interface Progress {
  consecutivePomos: number;
  totalPomos: number;
  wrapperEarned: boolean;
  dailyStats: DailyStat[];
  streakActive: number;
}

// Consecutive Pomodoro Types
export type ConsecutivePomoStatus = 'active' | 'completed' | 'broken';
export type BonusItem = 'wrapper' | 'bonusFlower';

export interface ConsecutivePomo {
  consecutivePomoId: string;
  sessionIds: string[];
  bonusItem?: BonusItem;
  status: ConsecutivePomoStatus;
}
