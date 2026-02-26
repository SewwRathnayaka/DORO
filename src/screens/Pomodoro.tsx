// src/screens/Pomodoro.tsx
// id: pomoTimer → route: "/timer/pomo"
// 25-minute Pomodoro timer with consecutive count, pause/reset/quit controls
//
// Consecutive Logic:
// - Increment count only on full 25-minute completion
// - Do NOT reset on pause or reset of a Pomodoro
// - Allow pausing and skipping short breaks without breaking the flow
// - Big Pomodoro = 3 consecutive Pomodoros (25 → short/skip → 25 → short/skip → 25)
// - After big Pomodoro completes, count resets to 0 automatically
// - Reset count if user quits, takes long break, or breaks sequence
//
// Testing Scenarios:
// 1. PAUSE: Start timer → Click PAUSE → Count should remain unchanged → Click RESUME → Timer continues
// 2. SKIP BREAK: Complete Pomodoro → Navigate to home → Start new Pomodoro (skip break) → Count increments
// 3. QUIT: Start timer → Click QUIT → Confirm → Count resets to 0, navigate to home
// 4. LONG BREAK: Complete 2 Pomodoros → Take long break → Count resets (handled in Break screen)
// 5. BIG POMODORO: Complete 3 Pomodoros consecutively → Count shows 0, 1, 2 → After 3rd, count resets to 0

import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../state/store';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import PomodoroComplete from '../modals/PomodoroComplete';
import PomodoroQuit from '../modals/PomodoroQuit';
import { createSession, completeSession } from '../data/sessions';
import { earnFlowerFromSession } from '../data/flowers';

// Import assets (reuse from Home.tsx)
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');

// Import flower images based on selected flower
const roseImage = require('../../assets/rose.webp');
const lilyImage = require('../../assets/lilly.webp');
const carnationImage = require('../../assets/carnation.webp');
const daisyImage = require('../../assets/daisy.webp');
const peonyImage = require('../../assets/peonies.webp');
const orchidImage = require('../../assets/orchid.webp');

const FLOWER_IMAGES: Record<string, any> = {
  rose: roseImage,
  lily: lilyImage,
  carnation: carnationImage,
  daisy: daisyImage,
  peony: peonyImage,
  orchid: orchidImage,
};

const POMODORO_DURATION = 25 * 60; // 25 minutes

export default function Pomodoro() {
  const { navigateTo } = useNavigation();
  const {
    consecutiveCount,
    incrementConsecutive,
    resetConsecutive,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimeRemaining,
    timerRunning,
    timerPaused,
    timeRemaining,
    selectedFlower,
    loadSelectedFlower,
  } = useStore();
  const { 
    playClickSound, 
    playPomodoroMusic, 
    stopPomodoroMusic, 
    pausePomodoroMusic, 
    resumePomodoroMusic,
    playVictorySound,
    playSadSound,
  } = useAudio();

  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isBigPomodoro, setIsBigPomodoro] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false); // Track if this session has completed
  const updateStoreTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track pending store updates
  
  // Animation values for flower
  const saturationAnim = useRef(new Animated.Value(0)).current; // Start at 0 (low saturation/grayscale)
  const zoomAnim = useRef(new Animated.Value(1)).current; // Start at scale 1 (normal size)
  const zoomAnimationRef = useRef<Animated.CompositeAnimation | null>(null); // Reference to zoom animation
  const zoomAnimationFrameRef = useRef<number | null>(null); // For manual animation on web
  const zoomDirectionRef = useRef<'in' | 'out'>('in'); // Track zoom direction
  const zoomStartTimeRef = useRef<number>(0); // Track animation start time
  const rotateGlowAnim = useRef(new Animated.Value(0)).current; // For rotating glow effect
  const rotateGlowAnimationRef = useRef<Animated.CompositeAnimation | null>(null); // Reference to rotating glow animation

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timer completion - increment consecutive count and earn flower
  const handleTimerComplete = useCallback(async () => {
    if (hasCompletedRef.current) return; // Prevent double completion
    
    hasCompletedRef.current = true;
    
    // Stop timer and pomodoro music
    resetTimer();
    stopPomodoroMusic();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Play victory sound
    playVictorySound();

    // Check if this is the 3rd pomodoro (before incrementing)
    // If consecutiveCount is 2, this will be the 3rd pomodoro (big pomodoro)
    const bigPomo = consecutiveCount === 2;
    setIsBigPomodoro(bigPomo);
    
    // Create session and earn flower
    try {
      const flowerId = selectedFlower || 'rose';
      // Create session (flowerType is the selected flower)
      const session = await createSession('pomo', flowerId);
      
      // Complete the session
      await completeSession(session.sessionId);
      await earnFlowerFromSession(session.sessionId, flowerId, false);
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving Pomodoro completion:', error);
      }
    }
    
    // Increment consecutive count (store handles reset after 3)
    // After 3rd pomodoro (count becomes 3), store resets it to 0
    incrementConsecutive();
    
    // Show completion modal
    setShowCompleteModal(true);
  }, [resetTimer, incrementConsecutive, consecutiveCount, selectedFlower, stopPomodoroMusic, playVictorySound]);

  // Initialize zoom animation - create animation once on mount
  useEffect(() => {
    // Reset zoom to 1 (normal size)
    zoomAnim.setValue(1);
    
    // Create zoom animation loop with smooth easing
    // Animated.loop automatically loops infinitely
    // Use useNativeDriver: false for web compatibility (transforms need JS driver on web)
    const createZoomAnimation = () => {
      const sequence = Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.1, // Zoom in to 110%
          duration: 2000,
          easing: Easing.inOut(Easing.ease), // Smooth easing
          useNativeDriver: false, // Must be false for web transforms to work
        }),
        Animated.timing(zoomAnim, {
          toValue: 1, // Zoom out back to 100%
          duration: 2000,
          easing: Easing.inOut(Easing.ease), // Smooth easing
          useNativeDriver: false, // Must be false for web transforms to work
        }),
      ]);
      
      const animation = Animated.loop(sequence, {
        iterations: -1, // Infinite iterations
      });
      
      return animation;
    };

    zoomAnimationRef.current = createZoomAnimation();

    return () => {
      if (zoomAnimationRef.current) {
        zoomAnimationRef.current.stop();
        zoomAnimationRef.current = null;
      }
    };
  }, []); // Only create animation once - control start/stop in separate effect

  // Initialize rotating glow animation
  useEffect(() => {
    // Create rotating glow animation loop
    rotateGlowAnimationRef.current = Animated.loop(
      Animated.timing(rotateGlowAnim, {
        toValue: 1,
        duration: 3000, // 3 seconds for full rotation
        useNativeDriver: true,
      })
    );

    return () => {
      if (rotateGlowAnimationRef.current) {
        rotateGlowAnimationRef.current.stop();
      }
    };
  }, []); // Only create animation once

  // Load selected flower from localStorage on mount (for page refresh persistence)
  useEffect(() => {
    // Load selected flower from localStorage if store doesn't have one
    // This handles page refresh scenarios where Zustand store resets
    if (!selectedFlower) {
      loadSelectedFlower();
    }
  }, []); // Run once on mount

  // Initialize timer when component mounts - auto-start
  useEffect(() => {
    // Reset timer state and start fresh
    setTimeLeft(POMODORO_DURATION);
    // setTimeRemaining will be called by the sync effect below
    startTimer(POMODORO_DURATION, 'pomo');
    hasCompletedRef.current = false;
    
    // Reset saturation to 0 (low saturation/grayscale)
    saturationAnim.setValue(0);
    
    // Reset zoom to 1 (normal size)
    zoomAnim.setValue(1);

    // Start pomodoro music after a short delay
    // On web, this gives time for user interaction to unlock audio context
    // Music will start automatically once audio context is unlocked
    setTimeout(() => {
      playPomodoroMusic();
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Stop pomodoro music on unmount
      stopPomodoroMusic();
    };
  }, [playPomodoroMusic, stopPomodoroMusic]); // Include audio functions

  // Sync timeLeft to store (separate effect to avoid render-time updates)
  useEffect(() => {
    // Clear any pending updates
    if (updateStoreTimeoutRef.current) {
      clearTimeout(updateStoreTimeoutRef.current);
    }
    
    // Only update if value actually changed to avoid unnecessary re-renders
    if (timeRemaining !== timeLeft) {
      // Defer store update to next tick to avoid render-time state updates
      updateStoreTimeoutRef.current = setTimeout(() => {
        setTimeRemaining(timeLeft);
        updateStoreTimeoutRef.current = null;
      }, 0);
    }
    
    // Update saturation based on time remaining
    // Saturation goes from 0 (grayscale) to 1 (full color) as time passes
    const progress = 1 - (timeLeft / POMODORO_DURATION); // 0 to 1
    const targetSaturation = progress; // 0 to 1
    
    // Animate saturation smoothly
    Animated.timing(saturationAnim, {
      toValue: targetSaturation,
      duration: 100, // Smooth transition
      useNativeDriver: false, // CSS filters don't support native driver
    }).start();
    
    return () => {
      if (updateStoreTimeoutRef.current) {
        clearTimeout(updateStoreTimeoutRef.current);
        updateStoreTimeoutRef.current = null;
      }
    };
  }, [timeLeft, timeRemaining, setTimeRemaining, saturationAnim]);


  // Manual zoom animation for web (since Animated.loop doesn't work reliably on web)
  const startManualZoomAnimation = useCallback(() => {
    if (Platform.OS !== 'web') {
      // Use native animation for non-web platforms
      if (zoomAnimationRef.current) {
        zoomAnimationRef.current.start();
      }
      return;
    }

    // Manual animation loop for web using requestAnimationFrame
    zoomAnim.setValue(1);
    zoomDirectionRef.current = 'in';
    zoomStartTimeRef.current = Date.now();

    const animate = () => {
      if (!timerRunning || timerPaused) {
        return;
      }

      const elapsed = Date.now() - zoomStartTimeRef.current;
      const cycleDuration = 4000; // 2s zoom in + 2s zoom out = 4s total
      const progress = (elapsed % cycleDuration) / cycleDuration; // 0 to 1

      let scale: number;
      if (progress < 0.5) {
        // First half: zoom in (1.0 -> 1.1)
        const inProgress = progress * 2; // 0 to 1
        scale = 1 + (0.1 * Easing.inOut(Easing.ease)(inProgress));
      } else {
        // Second half: zoom out (1.1 -> 1.0)
        const outProgress = (progress - 0.5) * 2; // 0 to 1
        scale = 1.1 - (0.1 * Easing.inOut(Easing.ease)(outProgress));
      }

      zoomAnim.setValue(scale);
      zoomAnimationFrameRef.current = requestAnimationFrame(animate);
    };

    zoomAnimationFrameRef.current = requestAnimationFrame(animate);
  }, [timerRunning, timerPaused]);

  const stopManualZoomAnimation = useCallback(() => {
    if (zoomAnimationFrameRef.current !== null) {
      cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
    if (zoomAnimationRef.current) {
      zoomAnimationRef.current.stop();
    }
    zoomAnim.setValue(1);
  }, []);

  // Control zoom and glow animations based on timer state
  useEffect(() => {
    // Ensure animation is created before trying to control it (for native platforms)
    if (!zoomAnimationRef.current && Platform.OS !== 'web') {
      const sequence = Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]);
      
      zoomAnimationRef.current = Animated.loop(sequence, {
        iterations: -1,
      });
    }

    if (timerRunning && !timerPaused) {
      if (Platform.OS === 'web') {
        // Use manual animation for web
        stopManualZoomAnimation(); // Stop any existing animation
        startManualZoomAnimation();
      } else {
        // Use Animated.loop for native platforms
        if (zoomAnimationRef.current) {
          zoomAnimationRef.current.stop();
          zoomAnim.setValue(1);
          zoomAnimationRef.current.start();
        }
      }
      
      if (rotateGlowAnimationRef.current) {
        rotateGlowAnimationRef.current.stop();
        rotateGlowAnimationRef.current.start();
      }
    } else {
      stopManualZoomAnimation();
      if (rotateGlowAnimationRef.current) {
        rotateGlowAnimationRef.current.stop();
      }
    }

    return () => {
      stopManualZoomAnimation();
    };
  }, [timerRunning, timerPaused, startManualZoomAnimation, stopManualZoomAnimation]);

  // Timer countdown logic - syncs with store state
  useEffect(() => {
    
    if (timerRunning && !timerPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          if (newTime <= 0) {
            // Timer completed - handle completion
            // Use setTimeout to defer completion handler
            setTimeout(() => {
              handleTimerComplete();
            }, 0);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerRunning, timerPaused, timeLeft, handleTimerComplete]); // Include handleTimerComplete

  // Handle pause - does NOT reset consecutive count
  const handlePause = () => {
    playClickSound();
    pauseTimer();
    pausePomodoroMusic();
  };

  // Handle resume - does NOT reset consecutive count
  const handleResume = () => {
    playClickSound();
    resumeTimer();
    resumePomodoroMusic();
  };

  // Handle reset - does NOT reset consecutive count, only resets timer and restarts it
  // Works whether timer is running or paused
  const handleReset = () => {
    playClickSound();
    // Stop current timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reset time and state
    setTimeLeft(POMODORO_DURATION);
    resetTimer();
    hasCompletedRef.current = false;
    // Restart the timer
    startTimer(POMODORO_DURATION, 'pomo');
    // Ensure pomodoro music continues playing (it should already be playing)
    // This call will restart it if it stopped for any reason
    setTimeout(() => {
      playPomodoroMusic();
    }, 100);
  };

  // Handle quit - RESETS consecutive count and shows quit modal
  const handleQuit = () => {
    playClickSound();
    playSadSound();
    // Pause the timer (don't reset it) so user can continue if they choose
    // This allows "Continue Focus" to resume from where it was paused
    pauseTimer();
    pausePomodoroMusic();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Stop animations while paused
    if (zoomAnimationRef.current) {
      zoomAnimationRef.current.stop();
      zoomAnim.setValue(1);
    }
    if (rotateGlowAnimationRef.current) {
      rotateGlowAnimationRef.current.stop();
    }
    // Show quit modal
    setShowQuitModal(true);
  };

  const handleContinueFocus = () => {
    playClickSound();
    // Resume the timer from where it was paused
    resumeTimer();
    resumePomodoroMusic();
    setShowQuitModal(false);
  };

  const handleQuitPomodoro = () => {
    playClickSound();
    // Actually quit - reset timer, reset consecutive count, and go to home
    resetTimer();
    stopPomodoroMusic();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Stop animations
    if (zoomAnimationRef.current) {
      zoomAnimationRef.current.stop();
      zoomAnim.setValue(1);
    }
    if (rotateGlowAnimationRef.current) {
      rotateGlowAnimationRef.current.stop();
    }
    // Reset consecutive count
    resetConsecutive();
    // Close modal and navigate to home
    setShowQuitModal(false);
    navigateTo('home');
  };

  // Get flower image based on selected flower (default to rose if none selected)
  const getFlowerImage = () => {
    const flowerId = selectedFlower || 'rose';
    return FLOWER_IMAGES[flowerId] || roseImage;
  };

  // Display consecutive count (0, 1, or 2 for 1st, 2nd, 3rd pomodoro)
  const displayCount = consecutiveCount;

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Logo - Top Left */}
        <View style={styles.logoContainer}>
          <Image 
            source={logoImage} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Consecutive Pomodoro Count - Top Right */}
        <View style={styles.countContainer}>
          {Platform.OS === 'web' ? (
            <View style={[
              styles.countCapsule,
              {
                backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              } as any,
            ]}>
              <Text style={styles.countLabel}>No. of consecutive pomodoros</Text>
              <View style={styles.countValue}>
                <Text style={styles.countText}>{displayCount}</Text>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['#F1B89A', '#F3F3B7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.countCapsule}
            >
              <Text style={styles.countLabel}>No. of consecutive pomodoros</Text>
              <View style={styles.countValue}>
                <Text style={styles.countText}>{displayCount}</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Central Flower in White Circle */}
        <View style={styles.flowerContainer}>
          <View style={styles.whiteCircle}>
            {/* Rotating Glow Effect - Behind the flower */}
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  transform: [
                    {
                      rotate: rotateGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
            
            {/* Flower Image with Zoom Animation */}
            {Platform.OS === 'web' ? (
              <Animated.View
                style={[
                  styles.flowerImageWrapper,
                  {
                    transform: [
                      { scale: zoomAnim }
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    {
                      filter: saturationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['saturate(0%)', 'saturate(100%)'],
                      }),
                    } as any,
                  ]}
                >
                  <Image 
                    source={getFlowerImage()} 
                    style={styles.flowerImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </Animated.View>
            ) : (
              <Animated.View
                style={[
                  styles.flowerImageWrapper,
                  {
                    transform: [
                      { scale: zoomAnim }
                    ],
                  },
                ]}
              >
                <Image 
                  source={getFlowerImage()} 
                  style={styles.flowerImage}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
          </View>
        </View>

        {/* Control Buttons Row - PAUSE/RESUME on left, TIME label in center, RESET on right */}
        <View style={styles.controlsRow}>
          {/* Left Button - PAUSE or RESUME */}
          <View style={styles.controlButtonWrapper}>
            {timerRunning && !timerPaused && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePause}
                activeOpacity={0.8}
              >
                {Platform.OS === 'web' ? (
                  <View style={[
                    styles.buttonGradient,
                    {
                      backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                    } as any,
                  ]}>
                    <Text style={styles.buttonIcon}>⏸</Text>
                    <Text style={styles.buttonText}>PAUSE</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#E8E4BF', '#F7A0B1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonIcon}>⏸</Text>
                    <Text style={styles.buttonText}>PAUSE</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            )}

            {timerPaused && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleResume}
                activeOpacity={0.8}
              >
                {Platform.OS === 'web' ? (
                  <View style={[
                    styles.buttonGradient,
                    {
                      backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                    } as any,
                  ]}>
                    <Text style={styles.buttonIcon}>▶</Text>
                    <Text style={styles.buttonText}>RESUME</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#E8E4BF', '#F7A0B1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonIcon}>▶</Text>
                    <Text style={styles.buttonText}>RESUME</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Center - TIME Label */}
          <Text style={styles.timeLabel}>TIME</Text>

          {/* Right Button - RESET (always visible) */}
          <View style={styles.controlButtonWrapper}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              {Platform.OS === 'web' ? (
                <View style={[
                  styles.buttonGradient,
                  {
                    backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                  } as any,
                ]}>
                  <Text style={styles.buttonIcon}>↻</Text>
                  <Text style={styles.buttonText}>RESET</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#E8E4BF', '#F7A0B1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonIcon}>↻</Text>
                  <Text style={styles.buttonText}>RESET</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          {Platform.OS === 'web' ? (
            <View style={[
              styles.timerCapsule,
              {
                backgroundImage: 'radial-gradient(circle, #FEA8D7 0%, #EDEFBE 100%)',
              } as any,
            ]}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          ) : (
            <View style={styles.timerCapsule}>
              {/* Note: expo-linear-gradient doesn't support radial gradients natively */}
              {/* Using center color as background - radial gradient approximation */}
              <View style={[styles.timerCapsuleGradient, { backgroundColor: '#FEA8D7' }]}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* QUIT Button */}
        <TouchableOpacity
          style={styles.quitButton}
          onPress={handleQuit}
          activeOpacity={0.8}
        >
          {Platform.OS === 'web' ? (
            <View style={[
              styles.quitButtonGradient,
              {
                backgroundImage: 'linear-gradient(to right, #E7F3E8, #D0C2CA)',
              } as any,
            ]}>
              <Text style={styles.quitButtonText}>QUIT</Text>
            </View>
          ) : (
            <LinearGradient
              colors={['#E7F3E8', '#D0C2CA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quitButtonGradient}
            >
              <Text style={styles.quitButtonText}>QUIT</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        {/* Warning Text */}
        <Text style={styles.warningText}>Do not close this window</Text>
      </View>

      {/* Completion Modal */}
      <PomodoroComplete
        visible={showCompleteModal}
        flowerId={selectedFlower}
        onClose={() => {
          playClickSound();
          setShowCompleteModal(false);
        }}
        onGoHome={() => {
          playClickSound();
          setShowCompleteModal(false);
          navigateTo('home');
        }}
        onViewBouquet={() => {
          playClickSound();
          setShowCompleteModal(false);
          navigateTo('bouquet');
        }}
        onStartShortBreak={() => {
          playClickSound();
          setShowCompleteModal(false);
          navigateTo('breakTimer');
        }}
        onStartLongBreak={() => {
          playClickSound();
          setShowCompleteModal(false);
          navigateTo('breakTimer'); // TODO: Pass long break flag
        }}
        showLongBreak={isBigPomodoro} // Show long break after 3rd pomodoro
      />

      {/* Quit Modal */}
      <PomodoroQuit
        visible={showQuitModal}
        flowerId={selectedFlower}
        onClose={() => {
          playClickSound();
          setShowQuitModal(false);
        }}
        onContinueFocus={handleContinueFocus}
        onGoHome={handleQuitPomodoro}
        onViewBouquet={() => {
          playClickSound();
          setShowQuitModal(false);
          navigateTo('bouquet');
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
  },
  logo: {
    width: 248,
    height: 100,
  },
  countContainer: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 10,
  },
  countCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 328,
    height: 37,
    borderRadius: 18.5, // Fully rounded (height / 2)
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingLeft: 16,
    paddingRight: 0, // No padding on right to allow counter to extend
    paddingVertical: 0,
    justifyContent: 'space-between',
    overflow: 'visible', // Allow counter to extend beyond container
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    ...(Platform.OS !== 'web' ? { elevation: 2 } : {}),
  },
  countLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    flex: 1,
    paddingRight: 8, // Space between label and counter
  },
  countValue: {
    backgroundColor: '#FFFFFF',
    width: 47,
    height: 50,
    borderRadius: 25, // Fully rounded (height / 2)
    borderWidth: 0, // No border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6.5, // Extend beyond container (50 - 37) / 2 = 6.5
    alignSelf: 'center', // Center vertically relative to container
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
  },
  flowerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 10,
  },
  whiteCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 10,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    zIndex: 1, // Behind the flower image
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 215, 0, 0.4) 30%, rgba(255, 215, 0, 0) 60%, transparent 100%)',
    } as any : {
      backgroundColor: 'rgba(255, 215, 0, 0.3)',
      boxShadow: '0 0 50px rgba(255, 215, 0, 0.6)',
      elevation: 10,
    }),
  },
  flowerImageWrapper: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Above the glow
  },
  flowerImage: {
    width: 250,
    height: 250,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the buttons around TIME label
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 0, // Reduced margin to minimize gap around TIME label
    gap: 70, // Equal spacing on either side of TIME label (reduced for closer positioning)
  },
  controlButtonWrapper: {
    width: 127, // Fixed width matching button size
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 10, // Equal spacing on either side (reduced for closer positioning)
    marginTop: 0,
    marginBottom: 0,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 5, // Reduced margin above timer
    marginBottom: 20, // Reduced margin below timer
  },
  timerCapsule: {
    width: 156,
    height: 71,
    borderRadius: 35.5, // Half of height for fully rounded ends
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensure gradient stays within border
  },
  timerCapsuleGradient: {
    width: 156,
    height: 71,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
  },
  controlsContainer: {
    // Legacy container - keeping for structure
    height: 0,
  },
  controlButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: 127,
    height: 73,
    borderRadius: 25, // No border radius
    borderWidth: 0, // No border
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  quitButton: {
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 10,
  },
  quitButtonGradient: {
    width: 127,
    height: 42,
    borderRadius: 50,
    borderWidth: 0, // No border
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
