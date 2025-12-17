import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AccordionHeader } from './AccordionHeader';
import { HistoryList } from './HistoryList';
import { HealthEntry } from './types';
import { colors } from '../../theme';

interface SleepInputProps {
  isExpanded: boolean;
  onToggle: () => void;
  entries: HealthEntry[];
  onSave: (value: string) => void;
  onDelete?: (index: number) => void;
}

export const SleepInput: React.FC<SleepInputProps> = ({
  isExpanded,
  onToggle,
  entries,
  onSave,
  onDelete,
}) => {
  const [sleepHours, setSleepHours] = useState('');
  const [sleepMinutes, setSleepMinutes] = useState('');

  const handleSave = () => {
    if (sleepHours || sleepMinutes) {
      const hours = parseInt(sleepHours || '0', 10);
      const minutes = parseInt(sleepMinutes || '0', 10);
      const totalHours = (hours + minutes / 60).toFixed(1);
      onSave(`${sleepHours}h ${sleepMinutes}m (${totalHours}h)`);
      setSleepHours('');
      setSleepMinutes('');
    }
  };

  return (
    <View style={styles.accordionWrapper}>
      <View style={styles.accordionContainer}>
        <AccordionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          title="Sleep Hours"
          iconName="moon-outline"
          iconColor="#3b82f6"
          entriesCount={entries.length}
        />

        {isExpanded && (
          <View style={styles.accordionContent}>
          <View style={styles.multiInputRow}>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>Hours</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 7"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={sleepHours}
                onChangeText={setSleepHours}
              />
            </View>
            <Text style={styles.inputSeparator}>:</Text>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>Minutes</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 30"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={sleepMinutes}
                onChangeText={setSleepMinutes}
                maxLength={2}
              />
            </View>
            <TouchableOpacity style={styles.addButtonLarge} onPress={handleSave}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <HistoryList entries={entries} onDelete={onDelete} />
        </View>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionWrapper: {
    marginBottom: 12,
  },
  accordionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary[200],
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f9fafb',
  },
  multiInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  multiInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
  },
  multiInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  inputSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  addButtonLarge: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

