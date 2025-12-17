import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { authService } from '../../services/auth.service';
import { firestoreService } from '../../services/firestore.service';
import { styles } from './SymptomsScreen.styles';

type SymptomsStackParamList = {
  HomeMain: undefined;
  Symptoms: undefined;
};

type SymptomsScreenNavigationProp = NativeStackNavigationProp<SymptomsStackParamList, 'Symptoms'>;

interface SymptomOption {
  key: string;
  label: string;
  icon: string;
  category: 'emergency' | 'common' | 'other';
}

const EMERGENCY_SYMPTOMS: SymptomOption[] = [
  { key: 'chestPain', label: 'Chest Pain', icon: 'heart-outline', category: 'emergency' },
  { key: 'confusion', label: 'Confusion', icon: 'alert-circle-outline', category: 'emergency' },
  { key: 'bluish', label: 'Bluish Lips/Face', icon: 'color-palette-outline', category: 'emergency' },
];

const COMMON_SYMPTOMS: SymptomOption[] = [
  { key: 'fever', label: 'Fever', icon: 'thermometer-outline', category: 'common' },
  { key: 'dryCough', label: 'Dry Cough', icon: 'medical-outline', category: 'common' },
  { key: 'diffBreathing', label: 'Difficulty Breathing', icon: 'lungs-outline', category: 'common' },
  { key: 'soreThroat', label: 'Sore Throat', icon: 'mic-outline', category: 'common' },
  { key: 'fatigue', label: 'Fatigue', icon: 'battery-dead-outline', category: 'common' },
  { key: 'headache', label: 'Headache', icon: 'headset-outline', category: 'common' },
  { key: 'changeTasteSmell', label: 'Loss of Taste/Smell', icon: 'flower-outline', category: 'common' },
];

const OTHER_SYMPTOMS: SymptomOption[] = [
  { key: 'nausea', label: 'Nausea', icon: 'water-outline', category: 'other' },
  { key: 'aches', label: 'Body Aches', icon: 'body-outline', category: 'other' },
];

interface RiskFactorOption {
  key: string;
  label: string;
  icon: string;
}

const RISK_FACTORS: RiskFactorOption[] = [
  { key: 'diabetes', label: 'Diabetes', icon: 'medical-outline' },
  { key: 'cardioDisease', label: 'Cardiovascular Disease', icon: 'heart-outline' },
  { key: 'pulmonaryDisease', label: 'Pulmonary Disease', icon: 'lungs-outline' },
  { key: 'renalDisease', label: 'Renal Disease', icon: 'water-outline' },
  { key: 'malignancy', label: 'Cancer', icon: 'medical-outline' },
  { key: 'pregnant', label: 'Pregnancy', icon: 'flower-outline' },
  { key: 'immunocompromised', label: 'Immunocompromised', icon: 'shield-outline' },
];

export const SymptomsScreen: React.FC = () => {
  const navigation = useNavigation<SymptomsScreenNavigationProp>();
  const user = authService.getCurrentUser();

  // Emergency symptoms
  const [chestPain, setChestPain] = useState<boolean | null>(null);
  const [confusion, setConfusion] = useState<boolean | null>(null);
  const [bluish, setBluish] = useState<boolean | null>(null);

  // Common symptoms
  const [fever, setFever] = useState<boolean | null>(null);
  const [dryCough, setDryCough] = useState<boolean | null>(null);
  const [diffBreathing, setDiffBreathing] = useState<boolean | null>(null);
  const [soreThroat, setSoreThroat] = useState<boolean | null>(null);
  const [fatigue, setFatigue] = useState<boolean | null>(null);
  const [headache, setHeadache] = useState<boolean | null>(null);
  const [changeTasteSmell, setChangeTasteSmell] = useState<boolean | null>(null);

  // Other symptoms
  const [nausea, setNausea] = useState<boolean | null>(null);
  const [aches, setAches] = useState<boolean | null>(null);

  // Risk factors
  const [diabetes, setDiabetes] = useState<boolean | null>(null);
  const [cardioDisease, setCardioDisease] = useState<boolean | null>(null);
  const [pulmonaryDisease, setPulmonaryDisease] = useState<boolean | null>(null);
  const [renalDisease, setRenalDisease] = useState<boolean | null>(null);
  const [malignancy, setMalignancy] = useState<boolean | null>(null);
  const [pregnant, setPregnant] = useState<boolean | null>(null);
  const [immunocompromised, setImmunocompromised] = useState<boolean | null>(null);

  // Exposure
  const [exposureKnown, setExposureKnown] = useState<boolean | null>(null);
  const [travel, setTravel] = useState<boolean | null>(null);

  // UI state
  const [showRiskFactors, setShowRiskFactors] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGoBack = () => {
    navigation.navigate('HomeMain');
  };

  const getSymptomValue = (key: string): boolean | null => {
    const symptomMap: { [key: string]: boolean | null } = {
      chestPain,
      confusion,
      bluish,
      fever,
      dryCough,
      diffBreathing,
      soreThroat,
      fatigue,
      headache,
      changeTasteSmell,
      nausea,
      aches,
    };
    return symptomMap[key] ?? null;
  };

  const setSymptomValue = (key: string, value: boolean | null) => {
    const setters: { [key: string]: (value: boolean | null) => void } = {
      chestPain: setChestPain,
      confusion: setConfusion,
      bluish: setBluish,
      fever: setFever,
      dryCough: setDryCough,
      diffBreathing: setDiffBreathing,
      soreThroat: setSoreThroat,
      fatigue: setFatigue,
      headache: setHeadache,
      changeTasteSmell: setChangeTasteSmell,
      nausea: setNausea,
      aches: setAches,
    };
    setters[key]?.(value);
  };

  const getRiskFactorValue = (key: string): boolean | null => {
    const riskMap: { [key: string]: boolean | null } = {
      diabetes,
      cardioDisease,
      pulmonaryDisease,
      renalDisease,
      malignancy,
      pregnant,
      immunocompromised,
    };
    return riskMap[key] ?? null;
  };

  const setRiskFactorValue = (key: string, value: boolean | null) => {
    const setters: { [key: string]: (value: boolean | null) => void } = {
      diabetes: setDiabetes,
      cardioDisease: setCardioDisease,
      pulmonaryDisease: setPulmonaryDisease,
      renalDisease: setRenalDisease,
      malignancy: setMalignancy,
      pregnant: setPregnant,
      immunocompromised: setImmunocompromised,
    };
    setters[key]?.(value);
  };

  const emergencyResult = (): boolean => {
    return chestPain === true || confusion === true || bluish === true;
  };

  const testAndIsolate = (): boolean => {
    return (
      fever === true ||
      dryCough === true ||
      diffBreathing === true ||
      soreThroat === true ||
      exposureKnown === true ||
      travel === true ||
      diabetes === true ||
      cardioDisease === true ||
      pulmonaryDisease === true ||
      renalDisease === true ||
      malignancy === true ||
      pregnant === true ||
      immunocompromised === true
    );
  };

  const getResult = (): { text: string; color: string; icon: string; description: string } => {
    if (emergencyResult()) {
      return {
        text: 'Seek Immediate Care',
        color: colors.error,
        icon: 'alert-circle',
        description: 'You have emergency symptoms. Please seek medical care immediately.',
      };
    }
    if (testAndIsolate()) {
      return {
        text: 'Test & Isolate',
        color: colors.warning,
        icon: 'shield-checkmark',
        description: 'You should get tested and isolate yourself. Monitor your symptoms closely.',
      };
    }
    return {
      text: 'No Action Needed',
      color: colors.success,
      icon: 'checkmark-circle',
      description: 'Based on your responses, no immediate action is required. Continue monitoring your health.',
    };
  };

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to save screening results.');
      return;
    }

    // Validate that all required fields are answered
    const requiredRiskFactors = [
      { value: diabetes, name: 'Diabetes' },
      { value: cardioDisease, name: 'Cardiovascular Disease' },
      { value: pulmonaryDisease, name: 'Pulmonary Disease' },
      { value: renalDisease, name: 'Renal Disease' },
      { value: malignancy, name: 'Cancer' },
      { value: pregnant, name: 'Pregnancy' },
      { value: immunocompromised, name: 'Immunocompromised' },
      { value: exposureKnown, name: 'Known exposure to COVID-19' },
      { value: travel, name: 'Recent travel' },
    ];

    const unansweredQuestions = requiredRiskFactors
      .filter((item) => item.value === null)
      .map((item) => item.name);

    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Incomplete Form',
        `Please answer all questions. Missing answers for:\n${unansweredQuestions.join('\n')}`
      );
      return;
    }

    try {
      const screeningData = {
        chestPain,
        confusion,
        bluish,
        fever,
        dryCough,
        diffBreathing,
        soreThroat,
        fatigue,
        headache,
        changeTasteSmell,
        nausea,
        aches,
        diabetes,
        cardioDisease,
        pulmonaryDisease,
        renalDisease,
        malignancy,
        pregnant,
        immunocompromised,
        exposureKnown,
        travel,
        seekCare: emergencyResult(),
        testAndIsolate: testAndIsolate(),
        result: getResult().text,
        timestamp: new Date().toISOString(),
      };

      // Save to Firestore (we'll add this method to firestoreService)
      await firestoreService.saveSymptomScreening(user.uid, screeningData);
      
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save screening results.');
    }
  };

  const RadioButton: React.FC<{
    value: boolean | null;
    onPress: (value: boolean) => void;
    label: string;
  }> = ({ value, onPress, label }) => {
    return (
      <View style={styles.radioRow}>
        <Text style={styles.radioLabel}>{label}</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, value === true && styles.radioButtonSelected]}
            onPress={() => onPress(true)}
          >
            <Text style={[styles.radioText, value === true && styles.radioTextSelected]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, value === false && styles.radioButtonSelected]}
            onPress={() => onPress(false)}
          >
            <Text style={[styles.radioText, value === false && styles.radioTextSelected]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const SymptomCard: React.FC<{
    symptom: SymptomOption;
    value: boolean | null;
    onValueChange: (value: boolean | null) => void;
  }> = ({ symptom, value, onValueChange }) => {
    const isSelected = value === true;
    const isEmergency = symptom.category === 'emergency';
    
    return (
      <TouchableOpacity
        style={[
          styles.symptomCard,
          isSelected && isEmergency && styles.symptomCardSelectedEmergency,
          isSelected && !isEmergency && styles.symptomCardSelected,
          !isSelected && isEmergency && styles.symptomCardEmergency,
        ]}
        onPress={() => onValueChange(value === true ? null : true)}
      >
        <Icon
          name={symptom.icon}
          size={24}
          color={
            isSelected && isEmergency
              ? colors.surface
              : isSelected && !isEmergency
              ? colors.surface
              : isEmergency
              ? colors.error
              : colors.primary[600]
          }
        />
        <Text
          style={[
            styles.symptomLabel,
            isSelected && isEmergency && styles.symptomLabelSelectedEmergency,
            isSelected && !isEmergency && styles.symptomLabelSelected,
            !isSelected && isEmergency && styles.symptomLabelEmergency,
          ]}
        >
          {symptom.label}
        </Text>
        {isSelected && (
          <Icon name="checkmark-circle" size={20} color={colors.surface} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

  if (submitted) {
    const result = getResult();
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
              <Text style={styles.headerTitle}>Screening Result</Text>
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
              <Text style={styles.headerTitle}>Screening Result</Text>
              <View style={styles.headerRight} />
            </View>
          </>
        )}

        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultCard, { borderColor: result.color }]}>
            <Icon name={result.icon} size={64} color={result.color} />
            <Text style={[styles.resultText, { color: result.color }]}>{result.text}</Text>
            <Text style={styles.resultDescription}>{result.description}</Text>
          </View>

          <TouchableOpacity
            style={styles.newScreeningButton}
            onPress={() => {
              // Reset all states
              setChestPain(null);
              setConfusion(null);
              setBluish(null);
              setFever(null);
              setDryCough(null);
              setDiffBreathing(null);
              setSoreThroat(null);
              setFatigue(null);
              setHeadache(null);
              setChangeTasteSmell(null);
              setNausea(null);
              setAches(null);
              setDiabetes(null);
              setCardioDisease(null);
              setPulmonaryDisease(null);
              setRenalDisease(null);
              setMalignancy(null);
              setPregnant(null);
              setImmunocompromised(null);
              setExposureKnown(null);
              setTravel(null);
              setSubmitted(false);
            }}
          >
            <Text style={styles.newScreeningButtonText}>New Screening</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Symptom Screening</Text>
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
            <Text style={styles.headerTitle}>Symptom Screening</Text>
            <View style={styles.headerRight} />
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>COVID-19 Symptom Screening</Text>
          <Text style={styles.subtitle}>Answer the questions below to assess your symptoms</Text>
        </View>

        {/* Emergency Symptoms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="alert-circle" size={24} color={colors.error} />
            <Text style={styles.sectionTitle}>Emergency Symptoms</Text>
          </View>
          <Text style={styles.sectionDescription}>
            If you have any of these symptoms, seek immediate medical care
          </Text>
          <View style={styles.symptomGrid}>
            {EMERGENCY_SYMPTOMS.map((symptom) => (
              <SymptomCard
                key={symptom.key}
                symptom={symptom}
                value={getSymptomValue(symptom.key)}
                onValueChange={(value) => setSymptomValue(symptom.key, value)}
              />
            ))}
          </View>
        </View>

        {/* Common Symptoms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="medical-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>Common Symptoms</Text>
          </View>
          <View style={styles.symptomGrid}>
            {COMMON_SYMPTOMS.map((symptom) => (
              <SymptomCard
                key={symptom.key}
                symptom={symptom}
                value={getSymptomValue(symptom.key)}
                onValueChange={(value) => setSymptomValue(symptom.key, value)}
              />
            ))}
          </View>
        </View>

        {/* Other Symptoms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="list-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>Other Symptoms</Text>
          </View>
          <View style={styles.symptomGrid}>
            {OTHER_SYMPTOMS.map((symptom) => (
              <SymptomCard
                key={symptom.key}
                symptom={symptom}
                value={getSymptomValue(symptom.key)}
                onValueChange={(value) => setSymptomValue(symptom.key, value)}
              />
            ))}
          </View>
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setShowRiskFactors(!showRiskFactors)}
          >
            <View style={styles.sectionHeader}>
              <Icon name="shield-outline" size={24} color={colors.warning} />
              <Text style={styles.sectionTitle}>Risk Factors</Text>
            </View>
            <Icon
              name={showRiskFactors ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {showRiskFactors && (
            <View style={styles.riskFactorsContainer}>
              {RISK_FACTORS.map((factor) => (
                <RadioButton
                  key={factor.key}
                  value={getRiskFactorValue(factor.key)}
                  onPress={(value) => setRiskFactorValue(factor.key, value)}
                  label={factor.label}
                />
              ))}
            </View>
          )}
        </View>

        {/* Exposure */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.sectionTitle}>Exposure</Text>
          </View>
          <View style={styles.exposureContainer}>
            <RadioButton
              value={exposureKnown}
              onPress={(value) => setExposureKnown(value)}
              label="Known exposure to COVID-19"
            />
            <RadioButton value={travel} onPress={(value) => setTravel(value)} label="Recent travel" />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Complete Screening</Text>
          <Icon name="checkmark-circle" size={24} color={colors.surface} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
