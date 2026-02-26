// src/components/Heatmap.tsx
// Progress calendar heatmap (GitHub-style)

import { View, Text, StyleSheet } from 'react-native';

interface HeatmapProps {
  data?: Array<{ date: string; value: number }>;
}

export default function Heatmap({ data: _data = [] }: HeatmapProps) {
  // TODO: Generate calendar grid and color cells based on data
  // For now, show placeholder

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Heatmap</Text>
      <Text style={styles.placeholder}>Calendar heatmap will be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    padding: 20,
  },
});
