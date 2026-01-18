import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  WeightInput,
  SleepInput,
  WaterInput,
  BloodPressureInput,
  MoodInput,
  SimpleInput,
} from '../../../components/health';
import { useHealthData } from '../../../contexts/HealthDataContext';
import { colors } from '../../../theme';
import { styles } from './HealthHistoryScreen.styles';
import { pdfExportService } from '../../../services/pdf-export.service';

type HealthStackParamList = {
  HealthHistory: undefined;
  HealthStats: undefined;
  Medications: undefined;
};

type HealthHistoryScreenNavigationProp = NativeStackNavigationProp<HealthStackParamList, 'HealthHistory'>;

export const HealthHistoryScreen: React.FC = () => {
  const navigation = useNavigation<HealthHistoryScreenNavigationProp>();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { healthData, addHealthEntry, deleteHealthEntry } = useHealthData();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSave = async (type: keyof typeof healthData, value: string) => {
    if (!value.trim()) {
      Alert.alert('Warning', 'Please enter a value');
      return;
    }

    try {
      await addHealthEntry(type, value);
      Alert.alert('Success', 'Data saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save data');
    }
  };

  const handleDelete = async (type: keyof typeof healthData, index: number) => {
    try {
      await deleteHealthEntry(type, index);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete data');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Veri var mı kontrol et
      const hasData = Object.values(healthData).some(entries => entries.length > 0);
      
      if (!hasData) {
        Alert.alert('No Data', 'There is no health data to export. Please add some health entries first.');
        return;
      }

      await pdfExportService.exportToPDF(healthData);
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Failed to export health report');
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      )}
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="dark-content" />
      )}
      {Platform.OS === 'android' ? (
        <View style={styles.statusBarSpacer} />
      ) : (
        <SafeAreaView style={styles.safeArea} />
      )}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
        <Text style={styles.title}>Health History</Text>
        <Text style={styles.subtitle}>Track your daily health metrics</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportPDF}
            >
              <Icon name="share-outline" size={20} color={colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => navigation.navigate('HealthStats')}
            >
              <Icon name="stats-chart-outline" size={24} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <WeightInput
          isExpanded={expandedSection === 'weight'}
          onToggle={() => toggleSection('weight')}
          entries={healthData.weight}
          onSave={(value) => handleSave('weight', value)}
          onDelete={(index) => handleDelete('weight', index)}
        />

        <SleepInput
          isExpanded={expandedSection === 'sleepHours'}
          onToggle={() => toggleSection('sleepHours')}
          entries={healthData.sleepHours}
          onSave={(value) => handleSave('sleepHours', value)}
          onDelete={(index) => handleDelete('sleepHours', index)}
        />

        <WaterInput
          isExpanded={expandedSection === 'waterIntake'}
          onToggle={() => toggleSection('waterIntake')}
          entries={healthData.waterIntake}
          onSave={(value) => handleSave('waterIntake', value)}
          onDelete={(index) => handleDelete('waterIntake', index)}
        />

        <BloodPressureInput
          isExpanded={expandedSection === 'bloodPressure'}
          onToggle={() => toggleSection('bloodPressure')}
          entries={healthData.bloodPressure}
          onSave={(value) => handleSave('bloodPressure', value)}
          onDelete={(index) => handleDelete('bloodPressure', index)}
        />

        <SimpleInput
          isExpanded={expandedSection === 'temperature'}
          onToggle={() => toggleSection('temperature')}
          title="Body Temperature"
          iconName="thermometer-outline"
          iconColor="#ef4444"
          entries={healthData.temperature}
          onSave={(value) => handleSave('temperature', value)}
          onDelete={(index) => handleDelete('temperature', index)}
          placeholder="e.g., 36.6"
          unit="°C"
          keyboardType="decimal-pad"
        />

        <SimpleInput
          isExpanded={expandedSection === 'pulse'}
          onToggle={() => toggleSection('pulse')}
          title="Heart Rate"
          iconName="heart-outline"
          iconColor="#ef4444"
          entries={healthData.pulse}
          onSave={(value) => handleSave('pulse', value)}
          onDelete={(index) => handleDelete('pulse', index)}
          placeholder="e.g., 72"
          unit="bpm"
          keyboardType="number-pad"
        />

        <SimpleInput
          isExpanded={expandedSection === 'bloodSugar'}
          onToggle={() => toggleSection('bloodSugar')}
          title="Blood Sugar"
          iconName="water-outline"
          iconColor="#ec4899"
          entries={healthData.bloodSugar}
          onSave={(value) => handleSave('bloodSugar', value)}
          onDelete={(index) => handleDelete('bloodSugar', index)}
          placeholder="e.g., 95"
          unit="mg/dL"
          keyboardType="number-pad"
        />

        <SimpleInput
          isExpanded={expandedSection === 'steps'}
          onToggle={() => toggleSection('steps')}
          title="Daily Steps"
          iconName="walk-outline"
          iconColor="#10b981"
          entries={healthData.steps}
          onSave={(value) => handleSave('steps', value)}
          onDelete={(index) => handleDelete('steps', index)}
          placeholder="e.g., 8000"
          unit="steps"
          keyboardType="number-pad"
        />

        <SimpleInput
          isExpanded={expandedSection === 'calories'}
          onToggle={() => toggleSection('calories')}
          title="Calories Burned"
          iconName="flame-outline"
          iconColor="#f97316"
          entries={healthData.calories}
          onSave={(value) => handleSave('calories', value)}
          onDelete={(index) => handleDelete('calories', index)}
          placeholder="e.g., 2000"
          unit="kcal"
          keyboardType="number-pad"
        />

        <SimpleInput
          isExpanded={expandedSection === 'exercise'}
          onToggle={() => toggleSection('exercise')}
          title="Exercise"
          iconName="fitness-outline"
          iconColor={colors.primary[600]}
          entries={healthData.exercise}
          onSave={(value) => handleSave('exercise', value)}
          onDelete={(index) => handleDelete('exercise', index)}
          placeholder="e.g., 30 min running"
          keyboardType="default"
          iconOptions={[
            { icon: 'walk-outline', label: 'Walking', value: 'Walking' },
            { icon: 'bicycle-outline', label: 'Cycling', value: 'Cycling' },
            { icon: 'fitness-outline', label: 'Running', value: 'Running' },
            { icon: 'barbell-outline', label: 'Gym', value: 'Gym' },
            { icon: 'water-outline', label: 'Swimming', value: 'Swimming' },
            { icon: 'basketball-outline', label: 'Basketball', value: 'Basketball' },
            { icon: 'football-outline', label: 'Football', value: 'Football' },
            { icon: 'tennisball-outline', label: 'Tennis', value: 'Tennis' },
            { icon: 'body-outline', label: 'Yoga', value: 'Yoga' },
            { icon: 'bicycle-outline', label: 'Cardio', value: 'Cardio' },
          ]}
        />

        <MoodInput
          isExpanded={expandedSection === 'mood'}
          onToggle={() => toggleSection('mood')}
          entries={healthData.mood}
          onSave={(value) => handleSave('mood', value)}
          onDelete={(index) => handleDelete('mood', index)}
        />

        <SimpleInput
          isExpanded={expandedSection === 'period'}
          onToggle={() => toggleSection('period')}
          title="Menstrual Cycle"
          iconName="flower-outline"
          iconColor="#ec4899"
          entries={healthData.period}
          onSave={(value) => handleSave('period', value)}
          onDelete={(index) => handleDelete('period', index)}
          placeholder="e.g., Day 1, Day 15"
          keyboardType="default"
        />

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate('Medications')}
        >
          <Icon name="medical-outline" size={24} color={colors.primary[600]} />
          <Text style={styles.manageButtonText}>Medications</Text>
          <Icon name="chevron-forward" size={20} color={colors.primary[600]} />
        </TouchableOpacity>

        <SimpleInput
          isExpanded={expandedSection === 'symptoms'}
          onToggle={() => toggleSection('symptoms')}
          title="Symptoms"
          iconName="medical-outline"
          iconColor="#f59e0b"
          entries={healthData.symptoms}
          onSave={(value) => handleSave('symptoms', value)}
          onDelete={(index) => handleDelete('symptoms', index)}
          placeholder="e.g., Headache, Fatigue"
          keyboardType="default"
        />
      </ScrollView>
    </View>
  );
};
