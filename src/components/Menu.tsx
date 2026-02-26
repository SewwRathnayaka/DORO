// src/components/Menu.tsx
// Sandwich menu component

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '../app/useNavigation';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function Menu({ visible, onClose }: MenuProps) {
  const { navigateTo } = useNavigation();

  if (!visible) return null;

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'bouquet', label: 'Bouquet' },
    { id: 'progress', label: 'Progress' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              navigateTo(item.id);
              onClose();
            }}
          >
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#ffffff',
    width: 250,
    height: '100%',
    padding: 20,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 18,
    color: '#000000',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
