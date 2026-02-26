// src/modals/PomodoroQuit.tsx
// Quit modal shown when user quits a Pomodoro session

import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';

interface PomodoroQuitProps {
  visible: boolean;
  flowerId: string | null;
  onClose: () => void;
  onGoHome: () => void;
  onViewBouquet: () => void;
  onContinueFocus: () => void; // Callback to continue/resume the timer
}

// Import wilted flower images
const roseWiltedImage = require('../../assets/rosew.webp');
const lilyWiltedImage = require('../../assets/lilyw.webp');
const carnationWiltedImage = require('../../assets/carnationw.webp');
const daisyWiltedImage = require('../../assets/daisyw.webp');
const peonyWiltedImage = require('../../assets/peoniesw.webp');
const orchidWiltedImage = require('../../assets/orchidw.webp');

const WILTED_FLOWER_IMAGES: Record<string, any> = {
  rose: roseWiltedImage,
  lily: lilyWiltedImage,
  carnation: carnationWiltedImage,
  daisy: daisyWiltedImage,
  peony: peonyWiltedImage,
  orchid: orchidWiltedImage,
};

export default function PomodoroQuit({
  visible,
  flowerId,
  onClose,
  onGoHome,
  onViewBouquet: _onViewBouquet,
  onContinueFocus,
}: PomodoroQuitProps) {
  const rotateGlowAnim = useRef(new Animated.Value(0)).current;
  const rotateGlowAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

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

    // Start the animation when modal is visible
    if (visible && rotateGlowAnimationRef.current) {
      rotateGlowAnimationRef.current.start();
    }

    return () => {
      if (rotateGlowAnimationRef.current) {
        rotateGlowAnimationRef.current.stop();
      }
    };
  }, [visible, rotateGlowAnim]);

  const getWiltedFlowerImage = () => {
    const id = flowerId || 'rose';
    return WILTED_FLOWER_IMAGES[id] || roseWiltedImage;
  };

  const { playClickSound } = useAudio();

  const handleContinueFocus = () => {
    playClickSound();
    onContinueFocus(); // This will resume the timer and close the modal
  };

  const handleQuit = () => {
    playClickSound();
    onGoHome(); // This will reset timer, reset consecutive count, and navigate to home
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
              <Text style={styles.title}>LEAVING ALREADY?</Text>
              
              {/* Descriptive Text */}
              <Text style={styles.description}>
                You were building focus and growing your bouquet.{'\n'}Quitting now will reset your consecutive Pomodoro progress.
              </Text>

              {/* Flower Display */}
              <View style={styles.flowerDisplayContainer}>
                <View style={styles.gradientCircle}>
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
                  
                  {/* Wilted Flower Image */}
                  <View
                    style={[
                      styles.gradientCircleInner,
                      {
                        backgroundImage: 'radial-gradient(circle, #E4EAE4 0%, #CEB6CC 100%)',
                      } as any,
                    ]}
                  >
                    <Image
                      source={getWiltedFlowerImage()}
                      style={styles.flowerImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* CONTINUE FOCUS Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleContinueFocus}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.buttonGradient,
                      {
                        backgroundImage: 'linear-gradient(to right, #F3F3B7, #F1B89A)',
                      } as any,
                    ]}
                  >
                    <Text style={styles.buttonText}>CONTINUE FOCUS</Text>
                  </View>
                </TouchableOpacity>

                {/* QUIT POMODORO Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleQuit}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.quitButtonGradient,
                      {
                        backgroundImage: 'linear-gradient(to right, #CFB8CD, #C0CDC0)',
                      } as any,
                    ]}
                  >
                    <Text style={styles.buttonText}>QUIT POMODORO</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['#CDB5CB', '#E7F2E8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.mainContainer}
            >
              {/* Title */}
              <Text style={styles.title}>LEAVING ALREADY?</Text>
              
              {/* Descriptive Text */}
              <Text style={styles.description}>
                You were building focus and growing your bouquet.{'\n'}Quitting now will reset your consecutive Pomodoro progress.
              </Text>

              {/* Flower Display */}
              <View style={styles.flowerDisplayContainer}>
                <View style={styles.gradientCircle}>
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
                  
                  {/* Wilted Flower Image */}
                  <LinearGradient
                    colors={['#E4EAE4', '#CEB6CC']}
                    style={styles.gradientCircleInner}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      source={getWiltedFlowerImage()}
                      style={styles.flowerImage}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* CONTINUE FOCUS Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleContinueFocus}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F3F3B7', '#F1B89A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>CONTINUE FOCUS</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* QUIT POMODORO Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleQuit}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#CFB8CD', '#C0CDC0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quitButtonGradient}
                  >
                    <Text style={styles.buttonText}>QUIT POMODORO</Text>
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
    width: 534,
    height: 700,
    borderRadius: 20,
    borderWidth: 13,
    borderColor: '#FFFFFF',
    paddingTop: 40,
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(to bottom, #CDB5CB, #E7F2E8)',
    } : {}),
  },
  title: {
    fontSize: 24,
    fontFamily: 'Goldman-Regular',
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    textTransform: 'uppercase',
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
  },
  flowerDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  gradientCircle: {
    width: 290, // diameter = 2 * radius = 2 * 145 = 290
    height: 290,
    borderRadius: 145, // radius = 145
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  gradientCircleInner: {
    width: 290,
    height: 290,
    borderRadius: 145,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Above the glow
    overflow: 'hidden',
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
  flowerImage: {
    width: 280,
    height: 280,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    width: 160,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
});
