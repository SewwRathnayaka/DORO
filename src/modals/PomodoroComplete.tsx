// src/modals/PomodoroComplete.tsx
// Completion modal shown when Pomodoro finishes

import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../hooks/useAudio';

interface PomodoroCompleteProps {
  visible: boolean;
  flowerId: string | null;
  onClose: () => void;
  onGoHome: () => void;
  onViewBouquet: () => void;
  onStartShortBreak: () => void;
  onStartLongBreak: () => void;
  showLongBreak: boolean; // True if user completed 3 consecutive pomodoros
}

// Import flower images
const roseImage = require('../../assets/rose.webp');
const lilyImage = require('../../assets/lilly.webp');
const carnationImage = require('../../assets/carnation.webp');
const daisyImage = require('../../assets/daisy.webp');
const peonyImage = require('../../assets/peonies.webp');
const orchidImage = require('../../assets/orchid.webp');

// Import confetti image
const confettiImage = require('../../assets/confetti.webp');

const FLOWER_IMAGES: Record<string, any> = {
  rose: roseImage,
  lily: lilyImage,
  carnation: carnationImage,
  daisy: daisyImage,
  peony: peonyImage,
  orchid: orchidImage,
};

export default function PomodoroComplete({
  visible,
  flowerId,
  onClose,
  onGoHome,
  onViewBouquet,
  onStartShortBreak,
  onStartLongBreak,
  showLongBreak,
}: PomodoroCompleteProps) {
  const { playClickSound } = useAudio();

  const getFlowerImage = () => {
    const id = flowerId || 'rose';
    return FLOWER_IMAGES[id] || roseImage;
  };

  const handleGoHome = () => {
    playClickSound();
    onGoHome();
  };

  const handleViewBouquet = () => {
    playClickSound();
    onViewBouquet();
  };

  const handleStartShortBreak = () => {
    playClickSound();
    onStartShortBreak();
  };

  const handleStartLongBreak = () => {
    playClickSound();
    onStartLongBreak();
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
              {/* Confetti Image */}
              <View style={styles.confettiContainer}>
                <Image
                  source={confettiImage}
                  style={styles.confettiImage}
                  resizeMode="cover"
                />
              </View>
              
              {/* Title */}
              <Text style={styles.title}>YOU DID IT!</Text>
              
              {/* Description Text */}
              <Text style={styles.description}>
                You stayed focused and completed a Pomodoro.{'\n'}Every session helps your bouquet grow — one flower at a time.
              </Text>

              {/* Flower Display */}
              <View style={styles.flowerDisplayContainer}>
                <View
                  style={[
                    styles.gradientCircle,
                    {
                      backgroundImage: 'radial-gradient(circle, #F7C0A1 10%, #FADCDC 90%)',
                    } as any,
                  ]}
                >
                  <Image
                    source={getFlowerImage()}
                    style={styles.flowerImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* SHORT BREAK / LONG BREAK Button - Centered in its own row */}
                {showLongBreak ? (
                  <TouchableOpacity
                    style={styles.breakButton}
                    onPress={handleStartLongBreak}
                    activeOpacity={0.8}
                  >
                    {Platform.OS === 'web' ? (
                      <View
                        style={[
                          styles.breakButtonGradient,
                          {
                            backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                          } as any,
                        ]}
                      >
                        <Text style={styles.breakButtonText}>LONG BREAK</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#E8E4BF', '#F7A0B1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.breakButtonGradient}
                      >
                        <Text style={styles.breakButtonText}>LONG BREAK</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.breakButton}
                    onPress={handleStartShortBreak}
                    activeOpacity={0.8}
                  >
                    {Platform.OS === 'web' ? (
                      <View
                        style={[
                          styles.breakButtonGradient,
                          {
                            backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                          } as any,
                        ]}
                      >
                        <Text style={styles.breakButtonText}>SHORT BREAK</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#E8E4BF', '#F7A0B1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.breakButtonGradient}
                      >
                        <Text style={styles.breakButtonText}>SHORT BREAK</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                )}

                {/* BOUQUET and HOME Buttons - Side by side */}
                <View style={styles.bottomButtonsRow}>
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleViewBouquet}
                    activeOpacity={0.8}
                  >
                    {Platform.OS === 'web' ? (
                      <View
                        style={[
                          styles.bottomButtonGradient,
                          {
                            backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                          } as any,
                        ]}
                      >
                        <Text style={styles.bottomButtonText}>BOUQUET</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#E8E4BF', '#F7A0B1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bottomButtonGradient}
                      >
                        <Text style={styles.bottomButtonText}>BOUQUET</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleGoHome}
                    activeOpacity={0.8}
                  >
                    {Platform.OS === 'web' ? (
                      <View
                        style={[
                          styles.bottomButtonGradient,
                          {
                            backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                          } as any,
                        ]}
                      >
                        <Text style={styles.bottomButtonText}>HOME</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#E8E4BF', '#F7A0B1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bottomButtonGradient}
                      >
                        <Text style={styles.bottomButtonText}>HOME</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['#F69EAE', '#FBF1D8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.mainContainer}
            >
              {/* Confetti Image */}
              <View style={styles.confettiContainer}>
                <Image
                  source={confettiImage}
                  style={styles.confettiImage}
                  resizeMode="cover"
                />
              </View>
              
              {/* Title */}
              <Text style={styles.title}>YOU DID IT!</Text>
              
              {/* Description Text */}
              <Text style={styles.description}>
                You stayed focused and completed a Pomodoro.{'\n'}Every session helps your bouquet grow — one flower at a time.
              </Text>

              {/* Flower Display */}
              <View style={styles.flowerDisplayContainer}>
                <LinearGradient
                  colors={['#F7C0A1', '#FADCDC']}
                  style={styles.gradientCircle}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={getFlowerImage()}
                    style={styles.flowerImage}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* SHORT BREAK / LONG BREAK Button - Centered in its own row */}
                {showLongBreak ? (
                  <TouchableOpacity
                    style={styles.breakButton}
                    onPress={handleStartLongBreak}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.breakButtonGradient}
                    >
                      <Text style={styles.breakButtonText}>LONG BREAK</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.breakButton}
                    onPress={handleStartShortBreak}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.breakButtonGradient}
                    >
                      <Text style={styles.breakButtonText}>SHORT BREAK</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* BOUQUET and HOME Buttons - Side by side */}
                <View style={styles.bottomButtonsRow}>
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleViewBouquet}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.bottomButtonGradient}
                    >
                      <Text style={styles.bottomButtonText}>BOUQUET</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleGoHome}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E8E4BF', '#F7A0B1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.bottomButtonGradient}
                    >
                      <Text style={styles.bottomButtonText}>HOME</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 5,
    overflow: 'hidden',
  },
  confettiImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      objectFit: 'cover',
    } as any : {}),
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
    zIndex: 10, // Above confetti image (zIndex: 5)
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
    zIndex: 10, // Above confetti image (zIndex: 5)
    position: 'relative',
  },
  flowerDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    zIndex: 10, // Above confetti image (zIndex: 5)
    position: 'relative',
  },
  gradientCircle: {
    width: 290, // diameter = 2 * radius = 2 * 145 = 290
    height: 290,
    borderRadius: 145, // radius = 145
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS !== 'web' ? {
      backgroundColor: '#F7C0A1', // Fallback for native
    } : {}),
  },
  flowerImage: {
    width: 280,
    height: 280,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    zIndex: 10, // Above confetti image (zIndex: 5)
    position: 'relative',
  },
  breakButton: {
    width: 200,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 10,
  },
  breakButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    width: 160,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bottomButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
});
