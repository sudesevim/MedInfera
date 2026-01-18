import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AccordionHeader } from './AccordionHeader';
import { HistoryList } from './HistoryList';
import { HealthEntry } from './types';
import { colors } from '../../theme';

interface BloodPressureInputProps {
  isExpanded: boolean;
  onToggle: () => void;
  entries: HealthEntry[];
  onSave: (value: string) => void;
  onDelete?: (index: number) => void;
}

export const BloodPressureInput: React.FC<BloodPressureInputProps> = ({
  isExpanded,
  onToggle,
  entries,
  onSave,
  onDelete,
}) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const handleSave = () => {
    if (systolic && diastolic) {
      onSave(`${systolic}/${diastolic}`);
      setSystolic('');
      setDiastolic('');
    }
  };

  return (
    <View style={styles.accordionWrapper}>
      <View style={styles.accordionContainer}>
        <AccordionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          title="Blood Pressure"
          iconName="pulse-outline"
          iconColor="#f59e0b"
          entriesCount={entries.length}
        />

        {isExpanded && (
          <View style={styles.accordionContent}>
          <View style={styles.multiInputRow}>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>Systolic</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 120"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={systolic}
                onChangeText={setSystolic}
              />
            </View>
            <Text style={styles.inputSeparator}>/</Text>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>Diastolic</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 80"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={diastolic}
                onChangeText={setDiastolic}
              />
            </View>
            <TouchableOpacity style={styles.addButtonLarge} onPress={handleSave}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <HistoryList entries={entries} unit="mmHg" onDelete={onDelete} />
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
    backgroundColor: colors.mint.primary,
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

