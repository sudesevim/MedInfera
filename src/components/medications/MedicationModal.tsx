import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { MedicationTypeSelector, MedicationType } from './MedicationTypeSelector';
import { Medication } from '../../pages/medications/MedicationsScreen';

interface MedicationModalProps {
  visible: boolean;
  editingMedication: Medication | null;
  medicationName: string;
  medicationType: string;
  dosage: string;
  days: string;
  medicationTypes: MedicationType[];
  onClose: () => void;
  onSave: () => void;
  onNameChange: (text: string) => void;
  onTypeChange: (type: string) => void;
  onDosageChange: (text: string) => void;
  onDaysChange: (text: string) => void;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  visible,
  editingMedication,
  medicationName,
  medicationType,
  dosage,
  days,
  medicationTypes,
  onClose,
  onSave,
  onNameChange,
  onTypeChange,
  onDosageChange,
  onDaysChange,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMedication ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Aspirin"
                placeholderTextColor={colors.text.disabled}
                value={medicationName}
                onChangeText={onNameChange}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type *</Text>
              <MedicationTypeSelector
                types={medicationTypes}
                selectedType={medicationType}
                onSelectType={onTypeChange}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dosage *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100mg, 1 tablet"
                placeholderTextColor={colors.text.disabled}
                value={dosage}
                onChangeText={onDosageChange}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (Days) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 7"
                placeholderTextColor={colors.text.disabled}
                value={days}
                onChangeText={onDaysChange}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveModalButton} onPress={onSave}>
              <Text style={styles.saveModalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
  saveModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.mint.primary,
    alignItems: 'center',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});







