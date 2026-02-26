// src/hooks/useAudio.ts
// React hook for easy audio access in components

import { useEffect, useCallback } from 'react';
import { audioService } from '../services/audio';

/**
 * Hook for accessing audio functionality
 * Automatically initializes audio on mount
 */
// Track if audio has been initialized globally (once per app session)
let audioInitialized = false;

export function useAudio() {
  // Initialize audio on mount (only once globally)
  useEffect(() => {
    const initAudio = async () => {
      // Only initialize if not already initialized
      if (!audioInitialized) {
        try {
          await audioService.initialize();
          await audioService.loadSounds();
          audioInitialized = true;
        } catch (error) {
          if (__DEV__) {
            console.error('Error initializing audio:', error);
          }
        }
      } else {
        // Audio already initialized, just ensure sounds are loaded
        if (__DEV__) {
          console.log('Audio already initialized, skipping');
        }
      }
    };

    initAudio();

    // Don't cleanup on unmount - keep audio loaded across navigation
    // Only cleanup when app closes (handled by app lifecycle)
    return () => {
      // No cleanup - keep audio loaded
    };
  }, []);

  // Sound effects
  const playClickSound = useCallback(() => {
    audioService.playClickSound();
  }, []);

  const playVictorySound = useCallback(() => {
    audioService.playVictorySound();
  }, []);

  const playBreakAlarm = useCallback(() => {
    audioService.playBreakAlarm();
  }, []);

  const playSadSound = useCallback(() => {
    audioService.playSadSound();
  }, []);

  // Music
  const playBackgroundMusic = useCallback(() => {
    audioService.playBackgroundMusic();
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    audioService.stopBackgroundMusic();
  }, []);

  const playPomodoroMusic = useCallback(() => {
    audioService.playPomodoroMusic();
  }, []);

  const stopPomodoroMusic = useCallback(() => {
    audioService.stopPomodoroMusic();
  }, []);

  const pausePomodoroMusic = useCallback(() => {
    audioService.pausePomodoroMusic();
  }, []);

  const resumePomodoroMusic = useCallback(() => {
    audioService.resumePomodoroMusic();
  }, []);

  // Settings
  const setAudioSettings = useCallback((settings: {
    soundsEnabled?: boolean;
    musicEnabled?: boolean;
    volume?: number;
  }) => {
    audioService.setSettings(settings);
  }, []);

  const getAudioSettings = useCallback(() => {
    return audioService.getSettings();
  }, []);

  const testAudio = useCallback(async () => {
    return await audioService.testAudio();
  }, []);

  return {
    // Sound effects
    playClickSound,
    playVictorySound,
    playBreakAlarm,
    playSadSound,
    
    // Music
    playBackgroundMusic,
    stopBackgroundMusic,
    playPomodoroMusic,
    stopPomodoroMusic,
    pausePomodoroMusic,
    resumePomodoroMusic,
    
    // Settings
    setAudioSettings,
    getAudioSettings,
    testAudio,
  };
}
