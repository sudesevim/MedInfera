import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AccordionHeader } from './AccordionHeader';
import { HistoryList } from './HistoryList';
import { HealthEntry } from './types';
import { colors } from '../../theme';

interface MoodInputProps {
  isExpanded: boolean;
  onToggle: () => void;
  entries: HealthEntry[];
  onSave: (value: string) => void;
  onDelete?: (index: number) => void;
}

export const MoodInput: React.FC<MoodInputProps> = ({
  isExpanded,
  onToggle,
  entries,
  onSave,
  onDelete,
}) => {
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState('');
  const [moodInput, setMoodInput] = useState('');

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😰', label: 'Stressed' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '🤗', label: 'Excited' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🤒', label: 'Sick' },
    { emoji: '💪', label: 'Energetic' },
  ];

  const handleSave = () => {
    if (selectedMoodEmoji) {
      const value = selectedMoodEmoji + (moodInput ? ` - ${moodInput}` : '');
      onSave(value);
      setSelectedMoodEmoji('');
      setMoodInput('');
    }
  };

  return (
    <View style={styles.accordionWrapper}>
      <View style={styles.accordionContainer}>
        <AccordionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          title="Mood"
          iconName="happy-outline"
          iconColor="#f59e0b"
          entriesCount={entries.length}
        />

        {isExpanded && (
          <View style={styles.accordionContent}>
          <Text style={styles.sectionLabel}>How are you feeling?</Text>
          <View style={styles.emojiGrid}>
            {moods.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  selectedMoodEmoji === mood.label && styles.emojiButtonSelected,
                ]}
                onPress={() => setSelectedMoodEmoji(mood.label)}
              >
                <Text style={styles.emojiIcon}>{mood.emoji}</Text>
                <Text style={styles.emojiLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.inputFull}
            placeholder="Add notes (optional)"
            placeholderTextColor="#9ca3af"
            value={moodInput}
            onChangeText={setMoodInput}
          />
          <TouchableOpacity style={styles.addButtonFull} onPress={handleSave}>
            <Text style={styles.addButtonText}>Add Mood</Text>
          </TouchableOpacity>
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
  emojiButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: colors.mint.primary,
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
  inputFull: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    width: '100%',
    marginBottom: 12,
  },
  addButtonFull: {
    backgroundColor: colors.mint.primary,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: colors.mint.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

