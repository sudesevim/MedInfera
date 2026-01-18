import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HistoryListProps } from './types';
import { colors } from '../../theme';

export const HistoryList: React.FC<HistoryListProps> = ({ entries, unit = '', onDelete }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 3;

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

  const displayedEntries = showAll ? entries : entries.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = entries.length > INITIAL_DISPLAY_COUNT;

  return (
    <View style={styles.historyList}>
      <Text style={styles.historyTitle}>History</Text>
      {displayedEntries.map((entry, index) => (
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
      
      {hasMore && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.showMoreText}>
            {showAll ? 'Show Less' : `Show More (${entries.length - INITIAL_DISPLAY_COUNT} more)`}
          </Text>
          <Icon 
            name={showAll ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={colors.mint.primary} 
          />
        </TouchableOpacity>
      )}
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
    borderLeftColor: colors.mint.primary,
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
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.mint.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mint.soft,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mint.primary,
    marginRight: 6,
  },
});


