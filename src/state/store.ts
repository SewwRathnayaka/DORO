// src/state/store.ts
// Global app state store (using Zustand for simplicity)

import { create } from 'zustand';

// Define the complete store interface
interface StoreState {
  // App state
  currentScreen: string;
  modalVisible: string | null;
  menuVisible: boolean;
  
  // Timer state
  timerRunning: boolean;
  timerPaused: boolean;
  timeRemaining: number; // in seconds
  timerType: 'pomo' | 'break';
  consecutiveCount: number;
  
  // Flower selection state
  selectedFlower: string | null;
  shouldShowFlowerSelect: boolean;
  
  // App actions
  setCurrentScreen: (screenId: string) => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  
  // Timer actions
  startTimer: (duration: number, type: 'pomo' | 'break') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setTimeRemaining: (time: number) => void;
  incrementConsecutive: () => void;
  resetConsecutive: () => void;
  
  // Flower selection actions
  setSelectedFlower: (flowerId: string) => void;
  clearSelectedFlower: () => void;
  loadSelectedFlower: () => string | null;
  setShouldShowFlowerSelect: (show: boolean) => void;
}

// Create the store
export const useStore 	= create<StoreState>((set) => {
  // Initialize selectedFlower from localStorage if available
  let initialSelectedFlower: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      initialSelectedFlower = localStorage.getItem('doro_selectedFlower');
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load selected flower from localStorage:', error);
      }
    }
  }

  return {
  selectedFlower: initialSelectedFlower,
  shouldShowFlowerSelect: false,
  // App state properties
  currentScreen: 'logo',
  modalVisible: null,
  menuVisible: false,
  
  // Timer state properties
  timerRunning: false,
  timerPaused: false,
  timeRemaining: 0,
  timerType: 'pomo',
  consecutiveCount: 0,
  
  // App actions
  setCurrentScreen: (screenId: string) => {
    set({ currentScreen: screenId });
  },
  showModal: (modalId: string) => {
    set({ modalVisible: modalId });
  },
  hideModal: () => {
    set({ modalVisible: null });
  },
  toggleMenu: () => {
    set((state) => ({ menuVisible: !state.menuVisible }));
  },
  closeMenu: () => {
    set({ menuVisible: false });
  },
  
  // Timer actions
  startTimer: (duration: number, type: 'pomo' | 'break') => {
    set({ 
      timerRunning: true, 
      timerPaused: false, 
      timeRemaining: duration, 
      timerType: type 
    });
  },
  pauseTimer: () => {
    set({ timerRunning: false, timerPaused: true });
  },
  resumeTimer: () => {
    set({ timerRunning: true, timerPaused: false });
  },
  resetTimer: () => {
    set({ 
      timerRunning: false, 
      timerPaused: false, 
      timeRemaining: 0 
    });
  },
  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },
  incrementConsecutive: () => {
    set((state) => {
      const newCount = state.consecutiveCount + 1;
      // After completing 3 consecutive pomodoros (big pomodoro), reset to 0
      // Count shows: 0 (1st), 1 (2nd), 2 (3rd) - so reset when reaching 3
      if (newCount >= 3) {
        return { consecutiveCount: 0 };
      }
      return { consecutiveCount: newCount };
    });
  },
  resetConsecutive: () => {
    set({ consecutiveCount: 0 });
  },
  
  // Flower selection actions
  setSelectedFlower: (flowerId: string) => {
    set({ selectedFlower: flowerId });
    // Persist to localStorage for page refresh persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('doro_selectedFlower', flowerId);
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to save selected flower to localStorage:', error);
        }
      }
    }
  },
  clearSelectedFlower: () => {
    set({ selectedFlower: null });
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('doro_selectedFlower');
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to clear selected flower from localStorage:', error);
        }
      }
    }
  },
  // Load selected flower from localStorage
  loadSelectedFlower: () => {
    if (typeof window !== 'undefined') {
      try {
        const savedFlower = localStorage.getItem('doro_selectedFlower');
        if (savedFlower) {
          set({ selectedFlower: savedFlower });
          return savedFlower;
        }
      } catch (error) {
        if (__DEV__) {
        console.error('Failed to load selected flower from localStorage:', error);
      }
      }
    }
    return null;
  },
  setShouldShowFlowerSelect: (show: boolean) => {
    set({ shouldShowFlowerSelect: show });
  },
  };
});
