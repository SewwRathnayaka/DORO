// src/components/FlowerCard.tsx
// Individual flower UI component

import { View, Text, StyleSheet } from 'react-native';

interface FlowerCardProps {
  flowerId: string;
  flowerType: string;
  earnedDate?: Date;
}

export default function FlowerCard({ flowerId: _flowerId, flowerType, earnedDate }: FlowerCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌸</Text>
      <Text style={styles.name}>{flowerType}</Text>
      {earnedDate && (
        <Text style={styles.date}>
          {earnedDate.toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    margin: 5,
    minWidth: 100,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  date: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
});
