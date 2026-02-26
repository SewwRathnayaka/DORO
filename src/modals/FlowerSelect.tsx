// src/modals/FlowerSelect.tsx
// id: flowerSelect (modal, no route)
// Flower selection modal with 2x3 grid layout

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../hooks/useAudio';

interface FlowerSelectProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (flowerId: string) => void;
}

// Import flower images
const roseImage = require('../../assets/rose.webp');
const lilyImage = require('../../assets/lilly.webp');
const carnationImage = require('../../assets/carnation.webp');
const daisyImage = require('../../assets/daisy.webp');
const peonyImage = require('../../assets/peonies.webp');
const orchidImage = require('../../assets/orchid.webp');

// Flower data in grid order: Row 1 (Rose, Lily, Carnation), Row 2 (Daisy, Peony, Orchid)
const flowers = [
  { id: 'rose', name: 'Rose', image: roseImage },
  { id: 'lily', name: 'Lily', image: lilyImage },
  { id: 'carnation', name: 'Carnation', image: carnationImage },
  { id: 'daisy', name: 'Daisy', image: daisyImage },
  { id: 'peony', name: 'Peony', image: peonyImage },
  { id: 'orchid', name: 'Orchid', image: orchidImage },
];

export default function FlowerSelect({ visible, onClose, onSelect }: FlowerSelectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { playClickSound } = useAudio();

  const handleSelect = (flowerId: string) => {
    playClickSound();
    onSelect(flowerId);
    onClose();
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  const handleHoverIn = (index: number) => {
    setHoveredIndex(index);
  };

  const handleHoverOut = () => {
    setHoveredIndex(null);
  };

  const modalContent = (
    <View style={styles.overlayWrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View
          style={styles.mainContainer}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <Text style={styles.title}>Choose the flower you want</Text>
          <View style={styles.grid}>
            {flowers.map((flower, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <View
                  key={flower.id}
                  style={styles.flowerCardWrapper}
                  {...(Platform.OS === 'web' && {
                    onMouseEnter: () => handleHoverIn(index),
                    onMouseLeave: handleHoverOut,
                  } as any)}
                >
                  <TouchableOpacity
                    style={styles.flowerCard}
                    onPress={() => handleSelect(flower.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.gradientContainer, isHovered && styles.gradientContainerHovered]}>
                      <View style={[
                        styles.goldRing,
                        isHovered && Platform.OS === 'web' && {
                          borderWidth: 3,
                          borderColor: '#F2F1B9',
                          boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.2), 0 0 90px rgba(255, 215, 0, 0.1)',
                        } as any,
                      ]}>
                        {Platform.OS === 'web' ? (
                          <View style={[
                            styles.gradientCircle,
                            styles.gradientCircleWeb,
                            isHovered && styles.gradientCircleHovered,
                            { background: 'radial-gradient(circle, rgba(242, 160, 172, 1) 0%, rgba(255, 255, 255, 0.80) 54%)' } as any,
                          ]}>
                            <Image
                              source={flower.image}
                              style={[styles.flowerImage, isHovered && styles.flowerImageHovered]}
                              resizeMode="contain"
                            />
                          </View>
                        ) : (
                          <LinearGradient
                            colors={['rgba(242, 160, 172, 1)', 'rgba(242, 160, 172, 0)']}
                            style={styles.gradientCircle}
                          >
                            <Image source={flower.image} style={styles.flowerImage} resizeMode="contain" />
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // On web/Electron: portal to document.body so overlay is always on top (avoids RN Modal issues)
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (!visible) return null;
    return createPortal(modalContent, document.body);
  }

  // Native: use Modal
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {modalContent}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrap: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2147483647,
      display: 'flex',
      flexDirection: 'column',
    } as any),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    width: 950, // Increased to fit all components
    minHeight: 650, // Increased height to fit all components
    backgroundColor: '#FADCDC', // White with 80% opacity
    borderRadius: 20,
    borderWidth: 7,
    borderColor: '#FFFFFF',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the grid
    alignItems: 'center',
    width: '100%',
    maxWidth: 1000, // Match container width
  },
  flowerCardWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  flowerCard: {
    width: 280, // Increased from 170
    height: 250, // Increased from 190
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5, // Increased vertical spacing between rows
  },
  gradientContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease-in-out',
    } as any),
  },
  gradientContainerHovered: Platform.OS === 'web' ? ({ transform: [{ scale: 1.1 }, { translateY: -15 }] } as any) : {},
  goldRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#F2F1B9', // Gold color
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease-in-out',
    } as any),
  },
  gradientCircle: {
    width: 236, // Slightly smaller to fit inside gold ring (240 - 4px border)
    height: 236,
    borderRadius: 118,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientCircleWeb: Platform.OS === 'web' ? ({ transition: 'all 0.3s ease-in-out' } as any) : {},
  gradientCircleHovered: Platform.OS === 'web' ? ({ boxShadow: '0 0 40px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 215, 0, 0.6)' } as any) : {},
  flowerImage: {
    width: 200,
    height: 200,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease-in-out',
    } as any),
  },
  flowerImageHovered: Platform.OS === 'web' ? ({ transform: [{ scale: 1.15 }] } as any) : {},
});
