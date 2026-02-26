// src/screens/Bouquet.tsx
// id: bouquet → route: "/bouquet"

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import { getAllEarnedFlowers } from '../data/flowers';
import { getUser } from '../data/user';
import { getFlowerPosition, getWrapperYPosition, getWrapperSize, FLOWER_WIDTH, FLOWER_HEIGHT } from '../utils/bouquetLayout';
import { EMPTY_BOUQUET_MESSAGE } from '../data/bouquets';
import type { EarnedFlower } from '../types/index';

// Import assets
const backgroundImage = require('../../assets/background.webp');
const logoImage = require('../../assets/logo.webp');
const wrapperImage = require('../../assets/wrapper.webp');

// Import flower images
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

export default function Bouquet() {
  const { navigateTo } = useNavigation();
  const { playClickSound, setAudioSettings } = useAudio();
  const [earnedFlowers, setEarnedFlowers] = useState<EarnedFlower[]>([]);

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

  // Load earned flowers from IndexedDB
  useEffect(() => {
    const loadEarnedFlowers = async () => {
      try {
        const flowers = await getAllEarnedFlowers();
        // Sort by session ID to maintain order (newest first, but we'll reverse for display)
        // Only take first 10 flowers (max bouquet size)
        setEarnedFlowers(flowers.slice(0, 10));
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading earned flowers:', error);
        }
      }
    };

    loadEarnedFlowers();
  }, []);

  const handleBack = () => {
    playClickSound();
    navigateTo('home');
  };

  const handleShare = () => {
    playClickSound();
    navigateTo('share');
  };

  const getFlowerImage = (flowerId: string) => {
    return FLOWER_IMAGES[flowerId] || roseImage;
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

        {/* Share Button - Right Side (only when there are flowers) */}
        {earnedFlowers.length > 0 && (
          <View style={styles.shareButtonContainer}>
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                style={styles.shareButtonWrapper}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.shareButton,
                  {
                    backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                  } as any,
                ]}>
                  <Text style={styles.shareButtonText}>SHARE</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.shareButtonWrapper}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#E8E4BF', '#F7A0B1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shareButton}
                >
                  <Text style={styles.shareButtonText}>SHARE</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content Area - Bouquet or empty message */}
        <View style={styles.contentArea}>
          <View style={styles.bouquetContainer}>
            {earnedFlowers.length === 0 ? (
              <Text style={styles.emptyBouquetMessage}>{EMPTY_BOUQUET_MESSAGE}</Text>
            ) : (
              <>
                {/* Render flowers up to 10 */}
                {earnedFlowers.slice(0, 10).map((earnedFlower, index) => {
                  const layout = getFlowerPosition(index);
                  if (!layout) return null;

                  return (
                    <View
                      key={`${earnedFlower.earnedFromSessionId}-${index}`}
                      style={[
                        styles.flowerWrapper,
                        {
                          transform: [
                            { translateX: layout.x },
                            { translateY: layout.y },
                            { rotate: `${layout.rotation}deg` },
                          ],
                        },
                      ]}
                    >
                      <Image
                        source={getFlowerImage(earnedFlower.flowerId)}
                        style={styles.flowerImage}
                        resizeMode="contain"
                      />
                    </View>
                  );
                })}

                {/* Wrapper - positioned below flowers */}
                {(() => {
              const wrapperSize = getWrapperSize(earnedFlowers.length);
              const wrapperY = getWrapperYPosition(earnedFlowers.length);
              return (
                <View
                  key={`wrapper-${earnedFlowers.length}-${wrapperSize.width}-${wrapperSize.height}`}
                  style={[
                    styles.wrapperContainer,
                    {
                      width: wrapperSize.width,
                      height: wrapperSize.height,
                      transform: [{ translateY: wrapperY }],
                    },
                  ]}
                >
                  <Image
                    source={wrapperImage}
                    style={[
                      styles.wrapperImage,
                      {
                        width: wrapperSize.width,
                        height: wrapperSize.height,
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              );
            })()}
              </>
            )}
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
    top: 140, // Position below logo (same as sidebar in Home.tsx)
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
  shareButtonContainer: {
    position: 'absolute',
    right: 550,
    top: 550, // Moved closer to bouquet
    zIndex: 5,
  },
  shareButtonWrapper: {
    overflow: 'hidden',
  },
  shareButton: {
    width: 155,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22.5, // Half of height for rounded corners
  },
  shareButtonText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  emptyBouquetMessage: {
    paddingTop: 350,
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 48,
    justifyContent: 'center',
    maxWidth: 560,
    lineHeight: 28,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5
    , // Reduced space for logo and buttons
  },
  bouquetContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 600, // Ensure enough space for bouquet
  },
  flowerWrapper: {
    position: 'absolute',
    width: FLOWER_WIDTH,
    height: FLOWER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowerImage: {
    width: FLOWER_WIDTH,
    height: FLOWER_HEIGHT,
  },
  wrapperContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Behind flowers
    // Width and height are set dynamically via inline styles
  },
  wrapperImage: {
    // Width and height are set dynamically via inline styles
  },
});
