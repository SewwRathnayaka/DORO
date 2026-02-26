// src/screens/Break.tsx
// id: breakTimer → route: "/timer/break"
// Break timer screen with cloud animation, pause and skip controls

import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../state/store';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import { getAllSessions } from '../data/sessions';
import BreakComplete from '../modals/BreakComplete';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');
const cloudImage = require('../../assets/cloud.webp');

// Break durations
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 10 * 60; // 10 minutes

export default function Break() {
  const { navigateTo } = useNavigation();
  const {
    consecutiveCount,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimeRemaining,
    timerRunning,
    timerPaused,
    timeRemaining,
    setShouldShowFlowerSelect,
    resetConsecutive,
  } = useStore();
  const { playClickSound, playBreakAlarm } = useAudio();

  const [isLongBreak, setIsLongBreak] = useState(false);
  const breakDuration = isLongBreak ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION;

  // Determine break type: long break comes after pomo+short break+pomo+short break+pomo (3 pomodoros)
  // Check if consecutiveCount === 0 (meaning it was just reset from 3) by checking recent sessions
  useEffect(() => {
    const checkBreakType = async () => {
      try {
        const allSessions = await getAllSessions();
        // Get most recent completed pomodoro session
        const completedPomodoros = allSessions
          .filter(session => 
            session.type === 'pomo' && 
            session.status === 'completed' && 
            session.endTime !== null
          )
          .sort((a, b) => {
            const aTime = a.endTime instanceof Date ? a.endTime.getTime() : new Date(a.endTime!).getTime();
            const bTime = b.endTime instanceof Date ? b.endTime.getTime() : new Date(b.endTime!).getTime();
            return bTime - aTime; // Newest first
          });

        // Check if most recent pomodoro was completed very recently (within last 60 seconds)
        // and consecutiveCount is 0 (meaning it was just reset from 3)
        const now = Date.now();
        const mostRecentPomo = completedPomodoros[0];
        
        if (mostRecentPomo && consecutiveCount === 0) {
          const endTime = mostRecentPomo.endTime instanceof Date 
            ? mostRecentPomo.endTime.getTime() 
            : new Date(mostRecentPomo.endTime!).getTime();
          const secondsSinceCompletion = (now - endTime) / 1000;
          
          // If pomodoro was completed within last 60 seconds and count is 0, it's likely a long break
          // (meaning we just completed the 3rd pomodoro which reset the count)
          if (secondsSinceCompletion < 60) {
            setIsLongBreak(true);
            // Reset consecutive count for next cycle
            resetConsecutive();
          } else {
            setIsLongBreak(false);
          }
        } else {
          setIsLongBreak(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking break type:', error);
        }
        setIsLongBreak(false);
      }
    };

    checkBreakType();
  }, [consecutiveCount, resetConsecutive]);

  const [timeLeft, setTimeLeft] = useState(breakDuration);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false); // Track if break has completed
  
  // Animation values for cloud
  const zoomAnim = useRef(new Animated.Value(1)).current; // Start at scale 1 (normal size)
  const zoomAnimationRef = useRef<Animated.CompositeAnimation | null>(null); // Reference to zoom animation
  const zoomAnimationFrameRef = useRef<number | null>(null); // For manual animation on web
  const zoomDirectionRef = useRef<'in' | 'out'>('in'); // Track zoom direction
  const zoomStartTimeRef = useRef<number>(0); // Track animation start time

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
  }, [timerRunning, timerPaused, zoomAnim]);

  const stopManualZoomAnimation = useCallback(() => {
    if (zoomAnimationFrameRef.current !== null) {
      cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
    if (zoomAnimationRef.current) {
      zoomAnimationRef.current.stop();
    }
    zoomAnim.setValue(1);
  }, [zoomAnim]);

  // Handle timer completion - show modal for short break, navigate to home for long break
  const handleTimerComplete = useCallback(() => {
    if (hasCompletedRef.current) return; // Prevent double completion
    
    hasCompletedRef.current = true;
    
    // Stop timer
    resetTimer();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop animations
    stopManualZoomAnimation();
    
    // Play break alarm
    playBreakAlarm();
    
    // Long break: navigate directly to home (no modal)
    // Short break: show BreakComplete modal
    if (isLongBreak) {
      // Reset consecutive count for next cycle
      resetConsecutive();
      navigateTo('home');
    } else {
      // Show BreakComplete modal for short breaks
      setShowCompleteModal(true);
    }
  }, [resetTimer, stopManualZoomAnimation, isLongBreak, resetConsecutive, navigateTo, playBreakAlarm]);

  // Handle pause
  const handlePause = useCallback(() => {
    playClickSound();
    pauseTimer();
  }, [pauseTimer, playClickSound]);

  // Handle resume
  const handleResume = useCallback(() => {
    playClickSound();
    resumeTimer();
  }, [resumeTimer, playClickSound]);

  // Handle skip - skip break and start new pomodoro
  const handleSkip = useCallback(() => {
    playClickSound();
    resetTimer();
    navigateTo('pomoTimer');
  }, [resetTimer, navigateTo, playClickSound]);

  // Control zoom animation based on timer state
  useEffect(() => {
    // Stop animation if modal is showing or break has completed
    if (showCompleteModal || hasCompletedRef.current) {
      stopManualZoomAnimation();
      return;
    }
    
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
        // Use native animation for non-web platforms
        if (zoomAnimationRef.current) {
          zoomAnimationRef.current.start();
        }
      }
    } else {
      // Stop animation when timer is paused or stopped
      stopManualZoomAnimation();
    }

    return () => {
      stopManualZoomAnimation();
    };
  }, [timerRunning, timerPaused, showCompleteModal, startManualZoomAnimation, stopManualZoomAnimation, zoomAnim]);

  // Initialize timer when component mounts - auto-start
  useEffect(() => {
    // Reset completion flag
    hasCompletedRef.current = false;
    
    // Reset timer state and start fresh
    setTimeLeft(breakDuration);
    startTimer(breakDuration, 'break');
    
    // Reset zoom to 1 (normal size)
    zoomAnim.setValue(1);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty deps - only run on mount

  // Sync timeLeft to store (separate effect to avoid render-time updates)
  useEffect(() => {
    if (timeRemaining !== timeLeft) {
      setTimeout(() => {
        setTimeRemaining(timeLeft);
      }, 0);
    }
  }, [timeLeft, timeRemaining, setTimeRemaining]);

  // Timer countdown logic
  useEffect(() => {
    // Don't run timer if modal is showing or break has completed
    if (timerRunning && !timerPaused && timeLeft > 0 && !showCompleteModal && !hasCompletedRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
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
  }, [timerRunning, timerPaused, timeLeft, showCompleteModal, handleTimerComplete]);

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

        {/* Cloud Container - Center */}
        <View style={styles.cloudContainer}>
          {/* White Circle Outline */}
          <View style={styles.whiteCircle}>
            {/* Cloud Image with Animation */}
            <Animated.View
              style={[
                styles.cloudImageWrapper,
                {
                  transform: [{ scale: zoomAnim }],
                },
              ]}
            >
              <Image
                source={cloudImage}
                style={styles.cloudImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Control Buttons Row - PAUSE/RESUME on left, TIME label in center, SKIP on right */}
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

          {/* Right Button - SKIP */}
          <View style={styles.controlButtonWrapper}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              {Platform.OS === 'web' ? (
                <View style={[
                  styles.buttonGradient,
                  {
                    backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                  } as any,
                ]}>
                  <Text style={styles.buttonIcon}>=&gt;</Text>
                  <Text style={styles.buttonText}>SKIP</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#E8E4BF', '#F7A0B1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonIcon}>=&gt;</Text>
                  <Text style={styles.buttonText}>SKIP</Text>
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
              <View style={[styles.timerCapsuleGradient, { backgroundColor: '#FEA8D7' }]}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Break Complete Modal */}
      <BreakComplete
        visible={showCompleteModal}
        onClose={() => {
          playClickSound();
          setShowCompleteModal(false);
        }}
        onGoHome={() => {
          playClickSound();
          setShowCompleteModal(false);
          navigateTo('home');
        }}
        onStartPomodoro={() => {
          playClickSound();
          setShowCompleteModal(false);
          // Set flag to trigger flower selection on home screen
          setShouldShowFlowerSelect(true);
          // Navigate to home - flower select modal will show automatically
          navigateTo('home');
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
  cloudContainer: {
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
  cloudImageWrapper: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cloudImage: {
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
    borderRadius: 35.5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  controlButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: 127,
    height: 73,
    borderRadius: 25,
    borderWidth: 0,
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
});
