import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { authService } from '../../services/auth.service';
import { firestoreService } from '../../services/firestore.service';
import { MedicationCard, MedicationModal, EmptyState } from '../../components/medications';
import type { MedicationType } from '../../components/medications';
import { styles } from './MedicationsScreen.styles';

type MedicationsStackParamList = {
  HealthHistory: undefined;
  Medications: undefined;
};

type MedicationsScreenNavigationProp = NativeStackNavigationProp<MedicationsStackParamList, 'Medications'>;

export interface Medication {
  id?: string;
  name: string;
  type: string;
  dosage: string;
  days: string;
  startDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const MEDICATION_TYPES: MedicationType[] = [
  { value: 'tablet', label: 'Tablet', icon: 'medical-outline' },
  { value: 'capsule', label: 'Capsule', icon: 'ellipse-outline' },
  { value: 'liquid', label: 'Liquid', icon: 'water-outline' },
  { value: 'injection', label: 'Injection', icon: 'medical-outline' },
  { value: 'cream', label: 'Cream', icon: 'color-palette-outline' },
  { value: 'drops', label: 'Drops', icon: 'water-outline' },
  { value: 'spray', label: 'Spray', icon: 'airplane-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation<MedicationsScreenNavigationProp>();
  const user = authService.getCurrentUser();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  // Form state
  const [medicationName, setMedicationName] = useState('');
  const [medicationType, setMedicationType] = useState('');
  const [dosage, setDosage] = useState('');
  const [days, setDays] = useState('');

  const loadMedications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const data = await firestoreService.getMedications(user.uid);
      setMedications(data);
    } catch (error: any) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handleGoBack = () => {
    navigation.navigate('HealthHistory');
  };

  const openAddModal = () => {
    setEditingMedication(null);
    setMedicationName('');
    setMedicationType('');
    setDosage('');
    setDays('');
    setModalVisible(true);
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationName(medication.name);
    setMedicationType(medication.type);
    setDosage(medication.dosage);
    setDays(medication.days);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMedication(null);
    setMedicationName('');
    setMedicationType('');
    setDosage('');
    setDays('');
  };

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to save medications.');
      return;
    }

    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter medication name');
      return;
    }

    if (!medicationType) {
      Alert.alert('Error', 'Please select medication type');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }

    if (!days.trim()) {
      Alert.alert('Error', 'Please enter number of days');
      return;
    }

    try {
      const medicationData: Medication = {
        name: medicationName.trim(),
        type: medicationType,
        dosage: dosage.trim(),
        days: days.trim(),
        startDate: new Date().toISOString(),
      };

      if (editingMedication?.id) {
        await firestoreService.updateMedication(user.uid, editingMedication.id, medicationData);
        Alert.alert('Success', 'Medication updated successfully');
      } else {
        await firestoreService.addMedication(user.uid, medicationData);
        Alert.alert('Success', 'Medication added successfully');
      }

      closeModal();
      loadMedications();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save medication');
    }
  };

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medication.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid || !medication.id) return;

            try {
              await firestoreService.deleteMedication(user.uid, medication.id);
              Alert.alert('Success', 'Medication deleted successfully');
              loadMedications();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    const typeObj = MEDICATION_TYPES.find((t) => t.value === type);
    return typeObj?.icon || 'medical-outline';
  };

  const getTypeLabel = (type: string) => {
    const typeObj = MEDICATION_TYPES.find((t) => t.value === type);
    return typeObj?.label || type;
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      )}
      {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
      {Platform.OS === 'ios' ? (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.customHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
              <Icon name="arrow-back" size={24} color={colors.surface} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Medications</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      ) : (
        <>
          <View style={styles.statusBarSpacer} />
          <View style={styles.customHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
              <Icon name="arrow-back" size={24} color={colors.surface} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Medications</Text>
            <View style={styles.headerRight} />
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Medications</Text>
          <Text style={styles.subtitle}>Manage your medication schedule</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : medications.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.medicationsList}>
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={openEditModal}
                onDelete={handleDelete}
                getTypeIcon={getTypeIcon}
                getTypeLabel={getTypeLabel}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add-circle" size={24} color={colors.surface} />
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>
      </ScrollView>

      <MedicationModal
        visible={modalVisible}
        editingMedication={editingMedication}
        medicationName={medicationName}
        medicationType={medicationType}
        dosage={dosage}
        days={days}
        medicationTypes={MEDICATION_TYPES}
        onClose={closeModal}
        onSave={handleSave}
        onNameChange={setMedicationName}
        onTypeChange={setMedicationType}
        onDosageChange={setDosage}
        onDaysChange={setDays}
      />
    </View>
  );
};

