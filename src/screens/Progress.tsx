// src/screens/Progress.tsx
// id: progress → route: "/progress"

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import { getTodayProgress, getOverallProgress } from '../data/progress';
import { getUser } from '../data/user';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');

interface TodayStats {
  pomodorosCompleted: number;
  totalFocusMinutes: number;
  currentStreak: number;
}

interface OverallStats {
  totalPomodoros: number;
  totalFocusMinutes: number;
}

export default function Progress() {
  const { navigateTo } = useNavigation();
  const { playClickSound, setAudioSettings } = useAudio();
  const [todayStats, setTodayStats] = useState<TodayStats>({
    pomodorosCompleted: 0,
    totalFocusMinutes: 0,
    currentStreak: 0,
  });
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalPomodoros: 0,
    totalFocusMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load audio settings
  useEffect(() => {
    const loadAudioSettings = async () => {
      try {
        const user = await getUser();
        if (user?.settings?.audioSettings) {
          setAudioSettings(user.settings.audioSettings);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading audio settings:', error);
        }
      }
    };
    loadAudioSettings();
  }, [setAudioSettings]);

  // Load progress data
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [today, overall] = await Promise.all([
          getTodayProgress(),
          getOverallProgress(),
        ]);
        setTodayStats(today);
        setOverallStats(overall);
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading progress:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleBack = () => {
    playClickSound();
    navigateTo('home');
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  };

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

        {/* Back Button - Left Side */}
        <View style={styles.backButtonContainer}>
          {Platform.OS === 'web' ? (
            <TouchableOpacity
              style={styles.backButtonWrapper}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <View style={[
                styles.backButton,
                {
                  backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                } as any,
              ]}>
                <Text style={styles.backButtonText}>back</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.backButtonWrapper}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F1B89A', '#F3F3B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>back</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* TODAY Section */}
          <View style={styles.section}>
            {/* TODAY Title */}
            {Platform.OS === 'web' ? (
              <View style={[
                styles.titleContainer,
                {
                  backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                } as any,
              ]}>
                <Text style={styles.titleText}>TODAY</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#E8E4BF', '#F7A0B1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleContainer}
              >
                <Text style={styles.titleText}>TODAY</Text>
              </LinearGradient>
            )}

            {/* Today's Stats Container */}
            <View style={styles.statsContainer}>
              {/* No. of pomodoros completed */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>No. of pomodoros completed</Text>
                <View style={styles.statValueCapsule}>
                  <Text style={styles.statValue}>{loading ? '0' : todayStats.pomodorosCompleted}</Text>
                </View>
              </View>

              {/* Total time for the day */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total time for the day</Text>
                <View style={styles.statValueCapsule}>
                  <Text style={styles.statValue}>{loading ? '0 min' : formatTime(todayStats.totalFocusMinutes)}</Text>
                </View>
              </View>

              {/* Maximum Pomodoros in a Day */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Max pomodoros in a day</Text>
                <View style={styles.statValueCapsule}>
                  <Text style={styles.statValue}>{loading ? '0' : todayStats.currentStreak}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* OVERALL Section */}
          <View style={styles.section}>
            {/* OVERALL Title */}
            {Platform.OS === 'web' ? (
              <View style={[
                styles.titleContainer,
                {
                  backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                } as any,
              ]}>
                <Text style={styles.titleText}>OVERALL</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#E8E4BF', '#F7A0B1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleContainer}
              >
                <Text style={styles.titleText}>OVERALL</Text>
              </LinearGradient>
            )}

            {/* Overall Stats Container */}
            <View style={styles.statsContainer}>
              {/* Total no. of pomodoros completed */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total no. of pomodoros completed</Text>
                <View style={styles.statValueCapsule}>
                  <Text style={styles.statValue}>{loading ? '0' : overallStats.totalPomodoros}</Text>
                </View>
              </View>

              {/* Total focus time */}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total focus time</Text>
                <View style={styles.statValueCapsule}>
                  <Text style={styles.statValue}>{loading ? '0 min' : formatTime(overallStats.totalFocusMinutes)}</Text>
                </View>
              </View>
            </View>
          </View>
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
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 140,
    zIndex: 5,
  },
  backButtonWrapper: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  backButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    textTransform: 'lowercase',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    gap: 30,
  },
  section: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 20,
  },
  titleContainer: {
    width: 155,
    height: 45,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 24,
    fontFamily: 'Goldman-Regular',
    fontWeight: '700',
    color: '#000000',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    gap: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      elevation: 2,
    }),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    flex: 1,
  },
  statValueCapsule: {
    backgroundColor: '#F7A0B3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    fontWeight: '600',
  },
});
