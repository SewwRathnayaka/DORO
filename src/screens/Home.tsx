// src/screens/Home.tsx
// id: home → route: "/home"
// Main hub with flower, start/break buttons, and navigation

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../app/useNavigation';
import { getEffectivePathname } from '../utils/electronEnv';
import { getAllSessions } from '../data/sessions';
import { getUser } from '../data/user';
import { useStore } from '../state/store';
import { useAudio } from '../hooks/useAudio';
import FlowerSelect from '../modals/FlowerSelect';
import type { Session } from '../types/index';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');
const flowerImage = require('../../assets/flower.webp');

export default function Home() {
  const { navigateTo } = useNavigation();
  const location = useLocation();
  const pathname = getEffectivePathname(location);
  const [hasCompletedPomoToday, setHasCompletedPomoToday] = useState(false);
  const [showFlowerSelect, setShowFlowerSelect] = useState(false);
  const [username, setUsername] = useState('');
  const [showToast, setShowToast] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;

  const { shouldShowFlowerSelect, setShouldShowFlowerSelect } = useStore();
  const { playClickSound, playBackgroundMusic, setAudioSettings } = useAudio();

  // Load username and show welcome toast when coming from logo page
  // Also load audio settings and start background music
  useEffect(() => {
    const loadUserAndShowToast = async () => {
      try {
        const user = await getUser();
        if (user && user.username) {
          setUsername(user.username);
          
          // Check if we're coming from logo page (set by LaunchGuard)
          const fromLogo = typeof window !== 'undefined' 
            ? sessionStorage.getItem('doro_fromLogo') === 'true'
            : false;
          
          // Show toast message "Hello [username], Welcome!" only when coming from logo page
          if (fromLogo) {
            // Clear the session flag
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('doro_fromLogo');
            }
            
            // Show toast after a short delay
            setTimeout(() => {
              setShowToast(true);
            }, 500);
          }

          // Load audio settings and start background music
          if (user.settings.audioSettings) {
            const audioSettings = user.settings.audioSettings;
            setAudioSettings(audioSettings);
            // Start background music if enabled
            // Note: On web, if audio context is already resumed, it will play immediately
            // Otherwise, it will set backgroundMusicPending and start after user interaction
            setTimeout(() => {
              if (audioSettings.musicEnabled) {
                playBackgroundMusic();
              }
            }, 500);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading user:', error);
        }
      }
    };

    loadUserAndShowToast();
  }, [setAudioSettings, playBackgroundMusic]);

  // Show toast animation
  useEffect(() => {
    if (showToast) {
      // Fade in and slide down
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowToast(false);
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Check store flag to auto-show flower select modal (e.g., from BreakComplete)
  useEffect(() => {
    if (shouldShowFlowerSelect) {
      setShowFlowerSelect(true);
      setShouldShowFlowerSelect(false); // Reset flag after showing
    }
  }, [shouldShowFlowerSelect, setShouldShowFlowerSelect]);

  // Slow rotation animation for flower - continuous loop while on page
  // Stop rotation when modal is open, resume when closed
  useEffect(() => {
    if (showFlowerSelect) {
      // Stop rotation when modal is open
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      return;
    }

    // Start/resume rotation when modal is closed
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds for full rotation
        useNativeDriver: false, // Set to false for web compatibility
      })
    );
    animationRef.current = rotateAnimation;
    rotateAnimation.start();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [rotateAnim, showFlowerSelect]);

  const flowerRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Check if user has completed a Pomodoro today
  // Re-check when component mounts or when returning to this screen
  useEffect(() => {
    const checkCompletedPomoToday = async () => {
      try {
        const allSessions = await getAllSessions();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completedPomoToday = allSessions.some((session: Session) => {
          if (session.type !== 'pomo' || session.status !== 'completed') {
            return false;
          }
          
          if (!session.endTime) {
            return false;
          }
          
          const sessionDate = new Date(session.endTime);
          sessionDate.setHours(0, 0, 0, 0);
          
          return sessionDate.getTime() === today.getTime();
        });
        
        setHasCompletedPomoToday(completedPomoToday);
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking completed Pomodoro:', error);
        }
        setHasCompletedPomoToday(false);
      }
    };

    checkCompletedPomoToday();
  }, [pathname]); // Re-check when route changes (e.g., returning from pomo timer)

  const handleStart = () => {
    playClickSound();
    // Open flower selection modal first
    console.log('START button clicked, opening flower select modal');
    setShowFlowerSelect(true);
    console.log('showFlowerSelect set to:', true);
  };

  const { setSelectedFlower } = useStore();

  const handleFlowerSelect = (flowerId: string) => {
    playClickSound();
    // Store selected flower in state
    setSelectedFlower(flowerId);
    // Close modal and navigate to Pomodoro timer with selected flower
    setShowFlowerSelect(false);
    navigateTo('pomoTimer');
  };

  const handleCloseFlowerSelect = () => {
    playClickSound();
    // Close modal without starting session
    setShowFlowerSelect(false);
    // Animation will resume automatically via useEffect when showFlowerSelect becomes false
  };

  const handleBreak = () => {
    playClickSound();
    navigateTo('breakTimer');
  };

  const handleBouquet = () => {
    playClickSound();
    navigateTo('bouquet');
  };

  const handleProgress = () => {
    playClickSound();
    navigateTo('progress');
  };

  const handleSettings = () => {
    playClickSound();
    navigateTo('settings');
  };

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      
      {/* Welcome Toast Notification */}
      {showToast && username && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <View style={styles.toast}>
            <Text style={styles.toastText}>Hello {username}, Welcome!</Text>
          </View>
        </Animated.View>
      )}
      
      <View style={styles.container}>
        {/* Logo - Top Left */}
        <View style={styles.logoContainer}>
          <Image 
            source={logoImage} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Sidebar Navigation - Below Logo */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarButtons}>
            {/* Your Bouquet Button */}
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleBouquet}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.sidebarButton,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                ]}>
                  <Text style={styles.sidebarButtonText}>YOUR BOUQUET</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleBouquet}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F1B89A', '#F3F3B7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sidebarButton}
                >
                  <Text style={styles.sidebarButtonText}>YOUR BOUQUET</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Progress Button - Centered vertically */}
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleProgress}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.sidebarButton,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                ]}>
                  <Text style={styles.sidebarButtonText}>PROGRESS</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleProgress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F1B89A', '#F3F3B7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sidebarButton}
                >
                  <Text style={styles.sidebarButtonText}>PROGRESS</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Settings Button */}
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleSettings}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.sidebarButton,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                ]}>
                  <Text style={styles.sidebarButtonText}>SETTINGS</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sidebarButtonContainer}
                onPress={handleSettings}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F1B89A', '#F3F3B7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sidebarButton}
                >
                  <Text style={styles.sidebarButtonText}>SETTINGS</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Central Content */}
        <View style={styles.centerContent}>
          {/* Flower Image with Rotation */}
          <Animated.View style={{ transform: [{ rotate: flowerRotation }] }}>
            <Image 
              source={flowerImage} 
              style={styles.flower}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Click here to start text */}
          <Text style={styles.clickText}>Click here to start</Text>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* START Button */}
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.button,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                ]}>
                  <Text style={styles.buttonText}>START</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F1B89A', '#F3F3B7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>START</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* BREAK Button - Only visible if Pomodoro completed today */}
            {hasCompletedPomoToday && (
              Platform.OS === 'web' ? (
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleBreak}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.button,
                    Platform.OS === 'web' && {
                      backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                    } as any,
                  ]}>
                    <Text style={styles.buttonText}>BREAK</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleBreak}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F1B89A', '#F3F3B7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>BREAK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>

      {/* Flower Selection Modal */}
      {showFlowerSelect && (
        <FlowerSelect
          visible={showFlowerSelect}
          onClose={handleCloseFlowerSelect}
          onSelect={handleFlowerSelect}
        />
      )}
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
    paddingTop: 100,
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
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 140, // Position below logo (logo height 100 + margin 20 + spacing 20)
    zIndex: 5,
  },
  sidebarButtons: {
    gap: 24, // Increased gap between sidebar buttons
  },
  sidebarButtonContainer: {
    alignSelf: 'flex-start', // Allow width to depend on content
    overflow: 'hidden',
  },
  sidebarButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24, // Padding instead of fixed width
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  sidebarButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  flower: {
    width: 258,
    height: 258,
    marginBottom: 20,
  },
  clickText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    marginBottom: 24,
    marginTop: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  buttonContainer: {
    width: 200,
    borderRadius: 50,
    overflow: 'hidden',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  toast: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    } : {
      elevation: 5,
    }),
  },
  toastText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
