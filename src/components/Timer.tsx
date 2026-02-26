// src/components/Timer.tsx
// Shared timer UI (used by Pomodoro + Break)

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store';

interface TimerProps {
  duration: number; // Duration in seconds
  type: 'pomo' | 'break';
  onComplete?: () => void;
}

export default function Timer({ duration, type, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Sync with Zustand store
  const { startTimer, pauseTimer, resetTimer: resetStoreTimer, setTimeRemaining } = useStore();
  
  // Use ref to avoid stale closure in onComplete
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Track previous state to sync only on actual changes
  const prevRunningRef = useRef(isRunning);
  const prevPausedRef = useRef(isPaused);
  
  // Sync timer state with Zustand store (only on state changes, not every render)
  useEffect(() => {
    const runningChanged = prevRunningRef.current !== isRunning;
    const pausedChanged = prevPausedRef.current !== isPaused;
    
    if (runningChanged || pausedChanged) {
      // Defer store updates to avoid React warnings
      setTimeout(() => {
        if (isRunning && !isPaused) {
          startTimer(timeLeft, type);
        } else if (isPaused) {
          pauseTimer();
        } else {
          // Not running and not paused = stopped
          resetStoreTimer();
        }
      }, 0);
      
      prevRunningRef.current = isRunning;
      prevPausedRef.current = isPaused;
    }
  }, [isRunning, isPaused, type, startTimer, pauseTimer, resetStoreTimer]); // Removed timeLeft to avoid calling startTimer on every second

  // Update store with remaining time (throttled to avoid too many updates)
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isRunning || isPaused) {
      // Clear previous timeout
      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }
      // Update store with a small delay to batch updates
      timeUpdateRef.current = setTimeout(() => {
        setTimeRemaining(timeLeft);
      }, 100);
    }
    
    return () => {
      if (timeUpdateRef.current) {
        clearTimeout(timeUpdateRef.current);
      }
    };
  }, [timeLeft, isRunning, isPaused, setTimeRemaining]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Call onComplete in next tick to avoid React warning
            setTimeout(() => {
              onCompleteRef.current?.();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRunning, isPaused, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(timeLeft)}</Text>
      <View style={styles.controls}>
        {!isRunning && !isPaused && (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        {isRunning && (
          <TouchableOpacity style={styles.button} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        {isPaused && (
          <>
            <TouchableOpacity style={styles.button} onPress={handleResume}>
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
