import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

export interface MedicationType {
  value: string;
  label: string;
  icon: string;
}

interface MedicationTypeSelectorProps {
  types: MedicationType[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

export const MedicationTypeSelector: React.FC<MedicationTypeSelectorProps> = ({
  types,
  selectedType,
  onSelectType,
}) => {
  return (
    <View style={styles.typeGrid}>
      {types.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeButton,
            selectedType === type.value && styles.typeButtonSelected,
          ]}
          onPress={() => onSelectType(type.value)}
        >
          <Icon
            name={type.icon}
            size={20}
            color={selectedType === type.value ? colors.surface : colors.mint.primary}
          />
          <Text
            style={[
              styles.typeButtonText,
              selectedType === type.value && styles.typeButtonTextSelected,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.mint.soft,
    backgroundColor: colors.mint.light,
    minWidth: 100,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mint.primary,
    marginLeft: 6,
  },
  typeButtonTextSelected: {
    color: colors.surface,
  },
});







