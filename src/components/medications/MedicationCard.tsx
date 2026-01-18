import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Medication } from '../../pages/medications/MedicationsScreen';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
  getTypeIcon: (type: string) => string;
  getTypeLabel: (type: string) => string;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onEdit,
  onDelete,
  getTypeIcon,
  getTypeLabel,
}) => {
  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Icon name={getTypeIcon(medication.type)} size={24} color={colors.mint.primary} />
          <View style={styles.medicationDetails}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationType}>{getTypeLabel(medication.type)}</Text>
          </View>
        </View>
        <View style={styles.medicationActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(medication)}
          >
            <Icon name="pencil" size={20} color={colors.mint.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(medication)}
          >
            <Icon name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.medicationDetailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Dosage</Text>
          <Text style={styles.detailValue}>{medication.dosage}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{medication.days} days</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  medicationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  medicationType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  medicationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.mint.light,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.error + '20',
  },
  medicationDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
});







