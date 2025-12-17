import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

export const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <Icon name="medical-outline" size={64} color={colors.primary[300]} />
      <Text style={styles.emptyStateText}>No medications yet</Text>
      <Text style={styles.emptyStateSubtext}>Add your first medication to get started</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});







