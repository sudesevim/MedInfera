import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccordionProps } from './types';

export const AccordionHeader: React.FC<AccordionProps & { iconName?: string; iconColor?: string }> = ({
  isExpanded,
  onToggle,
  title,
  emoji,
  iconName,
  iconColor = '#3b82f6',
  entriesCount: _entriesCount,
}) => {
  return (
    <TouchableOpacity
      style={styles.accordionHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.accordionTitleContainer}>
        {iconName ? (
          <Icon name={iconName} size={24} color={iconColor} style={styles.accordionIcon} />
        ) : (
          <Text style={styles.accordionEmoji}>{emoji}</Text>
        )}
        <Text style={styles.accordionTitle}>{title}</Text>
      </View>
      <Icon 
        name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
        size={20} 
        color="#6b7280" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  accordionIcon: {
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
});

