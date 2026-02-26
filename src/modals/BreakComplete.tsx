// src/modals/BreakComplete.tsx
// Completion modal shown when short break finishes

import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../hooks/useAudio';

interface BreakCompleteProps {
  visible: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onStartPomodoro: () => void;
}

// Import bouquet image
const bouquetImage = require('../../assets/bouquet.webp');

export default function BreakComplete({
  visible,
  onClose,
  onGoHome,
  onStartPomodoro,
}: BreakCompleteProps) {
  const { playClickSound } = useAudio();

  const handleGoHome = () => {
    playClickSound();
    onGoHome();
  };

  const handleStartPomodoro = () => {
    playClickSound();
    onStartPomodoro();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View 
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
        >
          {Platform.OS === 'web' ? (
            <View style={styles.mainContainer}>
              {/* Title */}
              <Text style={styles.title}>FEELING REFRESHED?</Text>
              
              {/* Description Text */}
              <Text style={styles.description}>
                A short pause can do wonders.{'\n'}One more focused session could make your bouquet bloom even more.
              </Text>

              {/* Bouquet Display */}
              <View style={styles.bouquetDisplayContainer}>
                <View
                  style={[
                    styles.gradientCircle,
                    {
                      backgroundImage: 'radial-gradient(circle, #F7C0A1 10%, #FADCDC 90%)',
                    } as any,
                  ]}
                >
                  <Image
                    source={bouquetImage}
                    style={styles.bouquetImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* START POMODORO Button - Centered */}
                <TouchableOpacity
                  style={styles.startPomodoroButton}
                  onPress={handleStartPomodoro}
                  activeOpacity={0.8}
                >
                  {Platform.OS === 'web' ? (
                    <View
                      style={[
                        styles.startPomodoroButtonGradient,
                        {
                          backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                        } as any,
                      ]}
                    >
                      <Text style={styles.startPomodoroButtonText}>START POMODORO</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.startPomodoroButtonGradient}
                    >
                      <Text style={styles.startPomodoroButtonText}>START POMODORO</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                {/* HOME Button - Centered below */}
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={handleGoHome}
                  activeOpacity={0.8}
                >
                  {Platform.OS === 'web' ? (
                    <View
                      style={[
                        styles.homeButtonGradient,
                        {
                          backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                        } as any,
                      ]}
                    >
                      <Text style={styles.homeButtonText}>HOME</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.homeButtonGradient}
                    >
                      <Text style={styles.homeButtonText}>HOME</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['#F69EAE', '#FBF1D8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.mainContainer}
            >
              {/* Title */}
              <Text style={styles.title}>FEELING REFRESHED?</Text>
              
              {/* Description Text */}
              <Text style={styles.description}>
                A short pause can do wonders.{'\n'}One more focused session could make your bouquet bloom even more.
              </Text>

              {/* Bouquet Display */}
              <View style={styles.bouquetDisplayContainer}>
                <LinearGradient
                  colors={['#F7C0A1', '#FADCDC']}
                  style={styles.gradientCircle}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={bouquetImage}
                    style={styles.bouquetImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* START POMODORO Button - Centered */}
                <TouchableOpacity
                  style={styles.startPomodoroButton}
                  onPress={handleStartPomodoro}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E8E4BF', '#F7A0B1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startPomodoroButtonGradient}
                  >
                    <Text style={styles.startPomodoroButtonText}>START POMODORO</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* HOME Button - Centered below */}
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={handleGoHome}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E8E4BF', '#F7A0B1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.homeButtonGradient}
                  >
                    <Text style={styles.homeButtonText}>HOME</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    width: 500,
    height: 650,
    borderRadius: 20,
    borderWidth: 13,
    borderColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(to bottom, #F69EAE, #FBF1D8)',
    } : {}),
  },
  title: {
    fontSize: 24,
    fontFamily: 'Goldman-Regular',
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    textTransform: 'uppercase',
    position: 'relative',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 18,
    paddingHorizontal: 20,
    position: 'relative',
  },
  bouquetDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  gradientCircle: {
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS !== 'web' ? {
      backgroundColor: '#F7C0A1', // Fallback for native
    } : {}),
  },
  bouquetImage: {
    width: 280,
    height: 280,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    position: 'relative',
  },
  startPomodoroButton: {
    width: 300,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  startPomodoroButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPomodoroButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  homeButton: {
    width: 186,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  homeButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
});
