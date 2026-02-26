// src/screens/Settings.tsx
// id: settings → route: "/settings"

import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ImageBackground, Image, Platform, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../app/useNavigation';
import { createOrUpdateUser, getUser, updateUserSettings } from '../data/user';
import { useAudio } from '../hooks/useAudio';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');

export default function Settings() {
  const { navigateTo } = useNavigation();
  const { playClickSound, setAudioSettings, playBackgroundMusic, stopBackgroundMusic } = useAudio();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [existingVolume, setExistingVolume] = useState<number | undefined>(undefined);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;

  // Load current user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();
        if (user) {
          setUsername(user.username);
          // Load audio settings
          if (user.settings.audioSettings) {
            setSoundsEnabled(user.settings.audioSettings.soundsEnabled);
            setMusicEnabled(user.settings.audioSettings.musicEnabled);
            setExistingVolume(user.settings.audioSettings.volume);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading user:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

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

  const handleSave = async () => {
    playClickSound();
    if (!username.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user with new username and audio settings
      const audioSettings = {
        soundsEnabled,
        musicEnabled,
        volume: existingVolume ?? 0.7, // Preserve existing volume or use default
      };
      await createOrUpdateUser(username.trim(), { soundOn: true, audioSettings });
      await updateUserSettings({ audioSettings });
      
      // Update audio service with new settings
      setAudioSettings(audioSettings);
      
      // Verify the user was saved by retrieving it
      const savedUser = await getUser();
      console.log('✅ Verified saved user:', savedUser);
      
      if (!savedUser) {
        throw new Error('User was not saved to IndexedDB');
      }
      
      // If username is empty after save, redirect to welcome
      if (!savedUser.username || savedUser.username.trim() === '') {
        console.log('Username is empty after save, redirecting to welcome');
        navigateTo('welcome');
        return;
      }
      
      // Show toast notification
      setShowToast(true);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      Alert.alert('Error', `Failed to update your name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    playClickSound();
    navigateTo('home');
  };

  const handleSoundsToggle = async () => {
    playClickSound();
    const newValue = !soundsEnabled;
    setSoundsEnabled(newValue);
    
      // Save immediately when toggled
      try {
        const audioSettings = {
          soundsEnabled: newValue,
          musicEnabled,
          volume: existingVolume ?? 0.7, // Preserve existing volume or use default
        };
      await updateUserSettings({ audioSettings });
      setAudioSettings(audioSettings);
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating sounds setting:', error);
      }
      // Revert on error
      setSoundsEnabled(soundsEnabled);
    }
  };

  const handleMusicToggle = async () => {
    playClickSound();
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    
    // Save immediately when toggled
    try {
      const audioSettings = {
        soundsEnabled,
        musicEnabled: newValue,
        volume: existingVolume ?? 0.7, // Preserve existing volume or use default
      };
      await updateUserSettings({ audioSettings });
      setAudioSettings(audioSettings);
      
      // If music is enabled, start it immediately
      // If disabled, stop it immediately
      if (newValue) {
        // Small delay to ensure settings are applied
        setTimeout(() => {
          playBackgroundMusic();
        }, 100);
      } else {
        stopBackgroundMusic();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating music setting:', error);
      }
      // Revert on error
      setMusicEnabled(musicEnabled);
    }
  };

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      
      {/* Toast Notification */}
      {showToast && (
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
            <Text style={styles.toastText}>Settings updated</Text>
          </View>
        </Animated.View>
      )}
      
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Image 
            source={logoImage} 
            style={styles.logo}
            resizeMode="contain"
          />

          {/* What is Pomodoro? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is Pomodoro?</Text>
            <Text style={styles.description}>
              The Pomodoro Technique is a time management method using a timer to break work into intervals, 
              <br />
              traditionally 25 minutes in length, separated by short breaks and long breaks.
            </Text>
          </View>

          {/* Earn Flowers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earn Flowers</Text>
            <Text style={styles.description}>
              Complete each 25-minute Pomodoro session to earn a beautiful digital flower. 
              Build your collection and grow your bouquet!
            </Text>
          </View>

          {/* Your Bouquet */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Bouquet</Text>
            <Text style={styles.description}>
              Every flower you earn is added to your personal bouquet. 
              Share your progress and bouquet to celebrate your focus achievements!
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Change your name:</Text>
            <TextInput
              style={[
                styles.input,
                Platform.OS === 'web' && {
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  outline: 'none',
                  boxShadow: 'none',
                } as any,
              ]}
              placeholder=""
              placeholderTextColor="#999999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isSubmitting && !isLoading}
            />
          </View>

          {/* Audio Settings */}
          <View style={styles.audioSettingsContainer}>
            <Text style={styles.audioSettingsTitle}>Audio Settings</Text>
            
            {/* Sounds Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <TouchableOpacity
                style={[styles.toggle, soundsEnabled && styles.toggleActive]}
                onPress={handleSoundsToggle}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleCircle, soundsEnabled && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>

            {/* Music Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Background Music</Text>
              <TouchableOpacity
                style={[styles.toggle, musicEnabled && styles.toggleActive]}
                onPress={handleMusicToggle}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleCircle, musicEnabled && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          {Platform.OS === 'web' ? (
            // Web: Use View with inline CSS gradient for better compatibility
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSave}
              disabled={!username.trim() || isSubmitting || isLoading}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.button,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                  (!username.trim() || isSubmitting || isLoading) && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Saving...' : 'SAVE'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            // Native: Use LinearGradient component
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSave}
              disabled={!username.trim() || isSubmitting || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F1B89A', '#F3F3B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  (!username.trim() || isSubmitting || isLoading) && styles.buttonDisabled
                ]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Saving...' : 'SAVE'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 248,
    height: 100,
    marginBottom: 40,
    marginTop: 40,
  },
  section: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  input: {
    width: 250,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderStyle: 'dashed',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: 8,
    fontSize: 15,
    backgroundColor: 'transparent',
    color: '#000000',
    textAlign: 'center',
  },
  buttonContainer: {
    width: 200,
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Goldman-Regular',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
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
  audioSettingsContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  audioSettingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  toggleActive: {
    backgroundColor: '#F7A0B1',
    borderColor: '#FFFFFF',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    ...(Platform.OS !== 'web' ? { elevation: 2 } : {}),
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
