// src/screens/Logo.tsx
// id: logo → route: "/"
// Logo screen with background image, centered logo, and loading animation
// Note: LaunchGuard handles redirect logic - this screen stays visible as loading fallback
// until Home or Welcome is ready. Minimum 3 seconds display time.

import { View, Image, ImageBackground, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { getUser } from '../data/user';
import { useAudio } from '../hooks/useAudio';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');

const MIN_DISPLAY_TIME = 3000; // 3 seconds minimum

export default function Logo() {
  // Animation for loading line - fills from 0% to 100% once
  const lineProgress = useRef(new Animated.Value(0)).current;
  const { playBackgroundMusic, setAudioSettings } = useAudio();

  // Initialize background music when logo page loads
  useEffect(() => {
    // Load user settings and trigger background music
    const initializeAudio = async () => {
      try {
        // Load user settings
        const user = await getUser();
        if (user?.settings?.audioSettings) {
          setAudioSettings(user.settings.audioSettings);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Logo: Error loading user settings:', error);
        }
      }
    };
    
    initializeAudio();
    
    // Trigger playBackgroundMusic after a delay to ensure audio service is ready
    // This will set backgroundMusicPending = true on web if audio context isn't resumed
    // Use multiple timeouts to ensure it fires even if component unmounts quickly
    const timer1 = setTimeout(() => {
      playBackgroundMusic();
    }, 2000);
    
    const timer2 = setTimeout(() => {
      playBackgroundMusic();
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [playBackgroundMusic, setAudioSettings]);


  useEffect(() => {
    let isMounted = true;
    let animationDuration = MIN_DISPLAY_TIME;

    const checkAppReady = async () => {
      const startTime = Date.now();
      
      try {
        // Check if user exists (simulates app loading)
        await getUser();
        
        const elapsed = Date.now() - startTime;
        // Ensure minimum 3 seconds, extend if loading took longer
        animationDuration = Math.max(MIN_DISPLAY_TIME, elapsed + 500); // Add 500ms buffer
      } catch (error) {
        if (__DEV__) {
          console.error('Error checking user:', error);
        }
        // On error, still use minimum time
        animationDuration = MIN_DISPLAY_TIME;
      }

      if (isMounted) {
        // Animate loader from 0% to 100% over the calculated duration
        Animated.timing(lineProgress, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }).start();
      }
    };

    checkAppReady();

    return () => {
      isMounted = false;
    };
  }, [lineProgress]);

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image 
          source={logoImage} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.loaderContainer}>
          <Animated.View 
            style={[
              styles.loaderLine,
              {
                width: lineProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 248,
    height: 248,
    marginBottom: 20,
  },
  loaderContainer: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loaderLine: {
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
});
