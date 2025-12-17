import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AccordionHeader } from './AccordionHeader';
import { HistoryList } from './HistoryList';
import { HealthEntry } from './types';
import { colors } from '../../theme';

interface WaterInputProps {
  isExpanded: boolean;
  onToggle: () => void;
  entries: HealthEntry[];
  onSave: (value: string) => void;
  onDelete?: (index: number) => void;
}

export const WaterInput: React.FC<WaterInputProps> = ({
  isExpanded,
  onToggle,
  entries,
  onSave,
  onDelete,
}) => {
  const [waterLiters, setWaterLiters] = useState('');
  const [waterMl, setWaterMl] = useState('');

  const waterOptions = [
    { icon: '🥤', label: 'Glass', amount: '0.25' },
    { icon: '💧', label: 'Cup', amount: '0.2' },
    { icon: '🍶', label: 'Bottle', amount: '0.5' },
    { icon: '🧃', label: 'Large Bottle', amount: '1' },
    { icon: '🚰', label: 'Jug', amount: '1.5' },
  ];

  const handleQuickAdd = (amount: string) => {
    onSave(amount);
  };

  const handleCustomSave = () => {
    const value = waterLiters + (waterMl ? '.' + waterMl : '');
    if (value) {
      onSave(value);
      setWaterLiters('');
      setWaterMl('');
    }
  };

  return (
    <View style={styles.accordionWrapper}>
      <View style={styles.accordionContainer}>
        <AccordionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          title="Water Intake"
          iconName="water-outline"
          iconColor="#06b6d4"
          entriesCount={entries.length}
        />

        {isExpanded && (
          <View style={styles.accordionContent}>
          <Text style={styles.sectionLabel}>Quick Add</Text>
          <View style={styles.emojiGrid}>
            {waterOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.waterButton}
                onPress={() => handleQuickAdd(option.amount)}
              >
                <Text style={styles.emojiIcon}>{option.icon}</Text>
                <Text style={styles.emojiLabel}>{option.label}</Text>
                <Text style={styles.waterAmount}>{option.amount}L</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Custom Amount</Text>
          <View style={styles.multiInputRow}>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>Liters</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 2"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={waterLiters}
                onChangeText={setWaterLiters}
              />
            </View>
            <Text style={styles.inputSeparator}>.</Text>
            <View style={styles.multiInputGroup}>
              <Text style={styles.inputLabel}>ml</Text>
              <TextInput
                style={styles.multiInput}
                placeholder="e.g., 500"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={waterMl}
                onChangeText={setWaterMl}
                maxLength={3}
              />
            </View>
            <TouchableOpacity style={styles.addButtonLarge} onPress={handleCustomSave}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <HistoryList entries={entries} unit="liters" onDelete={onDelete} />
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  waterButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  emojiIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  waterAmount: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '700',
    marginTop: 2,
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

