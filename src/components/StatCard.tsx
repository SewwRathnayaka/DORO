// src/components/StatCard.tsx
// Focus/break/pomo summary cards

import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 32,
    marginBottom: 10,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
});
