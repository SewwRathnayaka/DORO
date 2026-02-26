// src/screens/Welcome.tsx
// id: welcome → route: "/welcome"
// Explains Pomodoro system, flower rewards, bouquet concept, and collects username
// Appears for new users when no username is entered

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ImageBackground, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import { createOrUpdateUser, getUser } from '../data/user';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');

export default function Welcome() {
  const { navigateTo } = useNavigation();
  const { playClickSound } = useAudio();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    playClickSound();
    if (!username.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create or update user with username
      await createOrUpdateUser(username.trim());
      
      // Verify the user was saved by retrieving it
      const savedUser = await getUser();
      
      if (!savedUser) {
        throw new Error('User was not saved to IndexedDB');
      }
      
      // Navigate to home
      navigateTo('home');
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating user:', error);
      }
      Alert.alert('Error', `Failed to save your name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="light" />
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
            <Text style={styles.inputLabel}>Your name:</Text>
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
              editable={!isSubmitting}
            />
          </View>

          {/* Start Button */}
          {Platform.OS === 'web' ? (
            // Web: Use View with inline CSS gradient for better compatibility
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleStart}
              disabled={!username.trim() || isSubmitting}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.button,
                  Platform.OS === 'web' && {
                    backgroundImage: 'linear-gradient(to right, #F1B89A, #F3F3B7)',
                  } as any,
                  (!username.trim() || isSubmitting) && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Starting...' : 'START'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            // Native: Use LinearGradient component
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleStart}
              disabled={!username.trim() || isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F1B89A', '#F3F3B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  (!username.trim() || isSubmitting) && styles.buttonDisabled
                ]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Starting...' : 'START'}
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
});
