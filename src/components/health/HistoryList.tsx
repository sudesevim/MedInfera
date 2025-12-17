import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HistoryListProps } from './types';
import { colors } from '../../theme';

export const HistoryList: React.FC<HistoryListProps> = ({ entries, unit = '', onDelete }) => {
  if (entries.length === 0) {
    return <Text style={styles.noDataText}>No records yet</Text>;
  }

  const handleDelete = (index: number) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(index),
        },
      ]
    );
  };

  return (
    <View style={styles.historyList}>
      <Text style={styles.historyTitle}>History</Text>
      {entries.map((entry, index) => (
        <View key={index} style={styles.historyEntry}>
          <View style={styles.historyEntryLeft}>
            <Text style={styles.historyValue}>
              {entry.value} {unit}
            </Text>
            <Text style={styles.historyDate}>{entry.date}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(index)}
            >
              <Icon name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  historyList: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  historyEntryLeft: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  noDataText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});


