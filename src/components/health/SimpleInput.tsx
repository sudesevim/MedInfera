import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccordionHeader } from './AccordionHeader';
import { HistoryList } from './HistoryList';
import { HealthEntry } from './types';
import { colors } from '../../theme';

interface IconOption {
  icon: string;
  label: string;
  value: string;
}

interface SimpleInputProps {
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
  emoji?: string;
  iconName?: string;
  iconColor?: string;
  entries: HealthEntry[];
  onSave: (value: string) => void;
  onDelete?: (index: number) => void;
  placeholder: string;
  unit?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  iconOptions?: IconOption[];
}

export const SimpleInput: React.FC<SimpleInputProps> = ({
  isExpanded,
  onToggle,
  title,
  emoji,
  iconName,
  iconColor,
  entries,
  onSave,
  onDelete,
  placeholder,
  unit = '',
  keyboardType = 'default',
  iconOptions,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  const handleIconSelect = (iconValue: string) => {
    setSelectedIcon(iconValue);
    setInputValue(iconValue);
  };

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setInputValue('');
      setSelectedIcon('');
    }
  };

  return (
    <View style={styles.accordionWrapper}>
      <View style={styles.accordionContainer}>
        <AccordionHeader
          isExpanded={isExpanded}
          onToggle={onToggle}
          title={title}
          emoji={emoji}
          iconName={iconName}
          iconColor={iconColor}
          entriesCount={entries.length}
        />

        {isExpanded && (
          <View style={styles.accordionContent}>
          {iconOptions && iconOptions.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Quick Select</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconButton,
                      selectedIcon === option.value && styles.iconButtonSelected,
                    ]}
                    onPress={() => handleIconSelect(option.value)}
                  >
                    <Icon name={option.icon} size={24} color={selectedIcon === option.value ? (iconColor || colors.mint.primary) : '#6b7280'} />
                    <Text style={[
                      styles.iconLabel,
                      selectedIcon === option.value && styles.iconLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TextInput
            style={[styles.inputFull, iconOptions && iconOptions.length > 0 && styles.inputFullWithIcons]}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            keyboardType={keyboardType}
            value={inputValue}
            onChangeText={setInputValue}
          />
          <TouchableOpacity style={styles.addButtonFull} onPress={handleSave}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <HistoryList entries={entries} unit={unit} onDelete={onDelete} />
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: colors.mint.primary,
  },
  iconLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  iconLabelSelected: {
    color: colors.mint.primary,
    fontWeight: '600',
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
    marginTop: 8,
    marginBottom: 12,
  },
  inputFullWithIcons: {
    marginTop: 0,
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

