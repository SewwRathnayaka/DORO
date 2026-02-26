// src/screens/Share.tsx
// id: share → route: "/share"
// Share page for downloading and sharing bouquet image

import { useState, useEffect, useRef, type ComponentRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../app/useNavigation';
import { useAudio } from '../hooks/useAudio';
import { getAllEarnedFlowers } from '../data/flowers';
import { getOverallProgress } from '../data/progress';
import { getUser } from '../data/user';
import { getFlowerPosition, getWrapperYPosition, getWrapperSize, FLOWER_WIDTH, FLOWER_HEIGHT } from '../utils/bouquetLayout';
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

// App download link (to be configured)
const APP_DOWNLOAD_LINK = 'https://doro.app/download'; // Placeholder

export default function Share() {
  const { navigateTo } = useNavigation();
  const { playClickSound, setAudioSettings } = useAudio();
  const [earnedFlowers, setEarnedFlowers] = useState<EarnedFlower[]>([]);
  const [overallStats, setOverallStats] = useState<{ totalPomodoros: number; totalFocusMinutes: number }>({
    totalPomodoros: 0,
    totalFocusMinutes: 0,
  });
  const bouquetContainerRef = useRef<ComponentRef<typeof View> | null>(null);

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
        setEarnedFlowers(flowers.slice(0, 10));
      } catch (error) {
        console.error('Error loading earned flowers:', error);
      }
    };

    loadEarnedFlowers();
  }, []);

  // Load overall stats from IndexedDB
  useEffect(() => {
    const loadOverallStats = async () => {
      try {
        const stats = await getOverallProgress();
        setOverallStats(stats);
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading overall stats:', error);
        }
      }
    };

    loadOverallStats();
  }, []);

  // Format time as "X hr Y min"
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  };

  const handleBack = () => {
    playClickSound();
    navigateTo('bouquet');
  };

  const getFlowerImage = (flowerId: string) => {
    return FLOWER_IMAGES[flowerId] || roseImage;
  };

  // Handle download bouquet as image
  const handleDownload = async () => {
    playClickSound();
    try {
      if (Platform.OS === 'web') {
        // For web, use html2canvas to capture the rectangleContainer
        // Find the DOM element by nativeID
        const domElement = document.getElementById('bouquet-container');
        
        if (!domElement) {
          Alert.alert('Error', 'Unable to find image container. Please try again.');
          return;
        }

        // Load html2canvas dynamically (only on web)
        // @ts-ignore - Dynamic import is supported at runtime
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;
        
        // Capture the element as canvas
        // Temporarily ensure all children are visible for capture
        const originalOverflow = (domElement as HTMLElement).style.overflow;
        (domElement as HTMLElement).style.overflow = 'visible';
        
        // Small delay to ensure all elements are rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const canvas = await html2canvas(domElement, {
            backgroundColor: '#FFFFFF', // White background to match container
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            allowTaint: true,
            width: 400, // Explicit width to match container
            height: 550, // Explicit height to match container
            windowWidth: 400,
            windowHeight: 550,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc) => {
              // Ensure cloned document has proper styles
              const clonedElement = clonedDoc.getElementById('bouquet-container');
              if (clonedElement) {
                (clonedElement as HTMLElement).style.overflow = 'visible';
              }
            },
          });
          
          // Restore original overflow
          (domElement as HTMLElement).style.overflow = originalOverflow;
          
          // Convert canvas to blob and download
          canvas.toBlob((blob: Blob | null) => {
            if (!blob) {
              Alert.alert('Error', 'Failed to create image. Please try again.');
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'doro-bouquet.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 'image/png');
        } catch (error) {
          // Restore original overflow on error
          (domElement as HTMLElement).style.overflow = originalOverflow;
          throw error;
        }
      } else {
        // For native, use expo-sharing or react-native-view-shot
        // TODO: Implement native download functionality
        Alert.alert('Download', 'Download functionality coming soon!');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error downloading image:', error);
      }
      Alert.alert('Error', 'Failed to download image. Please try again.');
    }
  };

  // Handle share with link
  const handleShareWithLink = async () => {
    playClickSound();
    try {
      if (Platform.OS === 'web') {
        // For web, use Web Share API if available
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Check out my Doro bouquet!',
              text: `I've been focusing and growing my bouquet! Download Doro: ${APP_DOWNLOAD_LINK}`,
              url: APP_DOWNLOAD_LINK,
            });
          } catch (error) {
            // User cancelled or error occurred
            if ((error as Error).name !== 'AbortError') {
              if (__DEV__) {
                console.error('Error sharing:', error);
              }
            }
          }
        } else {
          // Fallback: copy link to clipboard
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(
              `Check out my Doro bouquet! Download Doro: ${APP_DOWNLOAD_LINK}`
            );
            Alert.alert('Link Copied', 'The link has been copied to your clipboard!');
          } else {
            Alert.alert(
              'Share',
              `Share this link: ${APP_DOWNLOAD_LINK}\n\nCopy the link and share it with your bouquet image!`
            );
          }
        }
      } else {
        // For native, use expo-sharing
        // TODO: Implement native share functionality with image and link
        Alert.alert('Share', 'Share functionality coming soon!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
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

        {/* Content Area - Bouquet Container */}
        <View style={styles.contentArea}>
          {/* Rectangular Container with Gradient */}
          {Platform.OS === 'web' ? (
            <View style={styles.rectangleContainer} ref={bouquetContainerRef} nativeID="bouquet-container">
              {/* Doro Logo - Left Upper Corner of Rectangle */}
              <View style={styles.logoOverlay}>
                <Image 
                  source={logoImage} 
                  style={styles.logoOverlayImage}
                  resizeMode="contain"
                />
              </View>

              {/* Circle with Radial Gradient - Background Layer */}
              <View style={styles.circleContainer}>
                <View
                  style={[
                    styles.gradientCircle,
                    {
                      backgroundImage: 'radial-gradient(circle, #F1F1BB 0%, #FADCDC 100%)',
                    } as any,
                  ]}
                />
              </View>

              {/* Bouquet - Top Layer - Exact structure from Bouquet.tsx */}
              <View 
                style={[
                  styles.bouquetWrapper,
                  {
                    transform: [
                      { translateX: -250 },
                      { translateY: -250 },
                      { scale: 0.6 }, // Scale down to fit in rectangle
                    ],
                  },
                ]}
              >
                <View style={styles.bouquetContainer}>
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
                  {earnedFlowers.length > 0 && (() => {
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
                </View>
              </View>

              {/* Overall Stats - Single Column */}
              <View style={styles.statsContainer}>
                <Text style={styles.statsLabel}>Total no. of pomodoros</Text>
                <Text style={styles.statsValue}>{overallStats.totalPomodoros}</Text>
                <Text style={styles.statsLabel}>Total focus time</Text>
                <Text style={styles.statsValue}>{formatTime(overallStats.totalFocusMinutes)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.rectangleContainer} ref={bouquetContainerRef} nativeID="bouquet-container">
              <LinearGradient
                colors={['#FADCDC', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.absoluteFill]}
              >
                {/* Doro Logo - Left Upper Corner of Rectangle */}
                <View style={styles.logoOverlay}>
                  <Image 
                    source={logoImage} 
                    style={styles.logoOverlayImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Circle with Radial Gradient - Background Layer */}
                <View style={styles.circleContainer}>
                  <LinearGradient
                    colors={['#F1F1BB', '#FADCDC']}
                    style={styles.gradientCircle}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                  />
                </View>

                {/* Bouquet - Top Layer - Exact structure from Bouquet.tsx */}
                <View 
                  style={[
                    styles.bouquetWrapper,
                    {
                      transform: [
                        { translateX: -250 },
                        { translateY: -250 },
                        { scale: 0.6 }, // Scale down to fit in rectangle
                      ],
                    },
                  ]}
                >
                  <View style={styles.bouquetContainer}>
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
                    {earnedFlowers.length > 0 && (() => {
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
                  </View>
                </View>

                {/* Overall Stats - Single Column */}
                <View style={styles.statsContainer}>
                  <Text style={styles.statsLabel}>Total no. of pomodoros</Text>
                  <Text style={styles.statsValue}>{overallStats.totalPomodoros}</Text>
                  <Text style={styles.statsLabel}>Total focus time</Text>
                  <Text style={styles.statsValue}>{formatTime(overallStats.totalFocusMinutes)}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* DOWNLOAD Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={handleDownload}
              activeOpacity={0.8}
            >
              {Platform.OS === 'web' ? (
                <View style={[
                  styles.actionButtonGradient,
                  {
                    backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                  } as any,
                ]}>
                  <Text style={styles.actionButtonText}>DOWNLOAD</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#E8E4BF', '#F7A0B1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>DOWNLOAD</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* SHARE WITH THE LINK Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.shareLinkButton]}
              onPress={handleShareWithLink}
              activeOpacity={0.8}
            >
              {Platform.OS === 'web' ? (
                <View style={[
                  styles.actionButtonGradient,
                  {
                    backgroundImage: 'linear-gradient(to right, #E8E4BF, #F7A0B1)',
                  } as any,
                ]}>
                  <Text style={styles.actionButtonText}>SHARE WITH THE LINK</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#E8E4BF', '#F7A0B1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>SHARE WITH THE LINK</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
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
  absoluteFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 14,
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
    paddingTop: 10,
  },
  rectangleContainer: {
    width: 400,
    height: 550,
    borderRadius: 0,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Keep hidden for visual clipping
    position: 'relative',
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'linear-gradient(to bottom, #FADCDC, #FFFFFF)',
    } : {}),
    marginBottom: 30,
  },
  circleContainer: {
    position: 'absolute',
    width: 320, // diameter = 2 * radius = 2 * 160 = 320 (smaller than rectangle)
    height: 320,
    borderRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    top: 115, // Center vertically: (550 - 320) / 2 = 115
    left: 40, // Center horizontally: (400 - 320) / 2 = 40
    zIndex: 1,
  },
  gradientCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    ...(Platform.OS !== 'web' ? {
      backgroundColor: '#F1F1BB', // Fallback for native
    } : {}),
  },
  logoOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 20,
    width: 80,
    height: 32,
  },
  logoOverlayImage: {
    width: 80,
    height: 32,
  },
  bouquetWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      { translateX: -200 },
      { translateY: -200 },
      { scale: 0.5 }, // Scale down to fit in rectangle
    ],
    zIndex: 10, // Higher z-index to appear on top
  },
  bouquetContainer: {
    position: 'relative',
    width: 520, // Original size from Bouquet.tsx
    height: 520, // Original size from Bouquet.tsx
    alignItems: 'center',
    justifyContent: 'flex-start',
    // No transforms here - let the wrapper handle scaling
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
    zIndex: 1, // Behind flowers (same as Bouquet.tsx)
  },
  wrapperImage: {
    // Width and height are set dynamically via inline styles
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  actionButton: {
    borderRadius: 17.5,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    width: 267,
    height: 35,
  },
  shareLinkButton: {
    width: 279,
    height: 35,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Goldman-Regular',
    color: '#000000',
    textTransform: 'uppercase',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 5,
    left: 270,
    alignItems: 'flex-start',
    zIndex: 15, // Above bouquet
  },
  statsLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    marginBottom: 1,
  },
  statsValue: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
});
