import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../../services/auth.service';
import { firestoreService } from '../../services/firestore.service';
import { colors } from '../../theme';
import { styles } from './EditProfileScreen.styles';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = authService.getCurrentUser();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);

  // Mevcut profil verilerini yükle
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const profile = await firestoreService.getUserProfile(user.uid);
        if (profile) {
          setDisplayName(profile.displayName || user?.displayName || '');
          setPhone(profile.phone || '');
          setDateOfBirth(profile.dateOfBirth || '');
          setGender(profile.gender || '');
          setBloodType(profile.bloodType || '');
          setHeight(profile.height || '');
          setWeight(profile.weight || '');
          setAllergies(profile.allergies || '');
        } else {
          // Profil yoksa sadece displayName'i ayarla
          setDisplayName(user?.displayName || '');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        // Hata durumunda sadece displayName'i ayarla
        setDisplayName(user?.displayName || '');
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Firebase Auth profilini güncelle
      await user.updateProfile({
        displayName: displayName.trim(),
      });

      // Firestore'a tüm profil verilerini kaydet
      await firestoreService.saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
        bloodType: bloodType.trim(),
        height: height.trim(),
        weight: weight.trim(),
        allergies: allergies.trim(),
        email: user.email || undefined,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.surface} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon name="create-outline" size={40} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>

        {/* Basic Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={24} color={colors.primary[600]} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="document-text-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <Icon name="mail-outline" size={20} color={colors.primary[400]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={user?.email || ''}
                editable={false}
              />
            </View>
            <View style={styles.helperTextContainer}>
              <Icon name="lock-closed-outline" size={12} color="#94a3b8" />
              <Text style={styles.helperText}> Email cannot be changed</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="call-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.inputWrapper}>
              <Icon name="calendar-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9ca3af"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionsRow}>
              {[
                { value: 'Male', iconName: 'man-outline', color: '#9333ea' },
                { value: 'Female', iconName: 'woman-outline', color: '#ec4899' },
                { value: 'Other', iconName: 'person-outline', color: '#8b5cf6' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    gender === option.value && {
                      ...styles.optionButtonActive,
                      borderColor: option.color,
                      backgroundColor: `${option.color}15`,
                    },
                  ]}
                  onPress={() => setGender(option.value)}
                >
                  <Icon name={option.iconName} size={20} color={gender === option.value ? option.color : '#64748b'} style={styles.optionIcon} />
                  <Text
                    style={[
                      styles.optionText,
                      gender === option.value && { color: option.color },
                    ]}
                  >
                    {option.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Medical Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="medical-outline" size={24} color={colors.primary[600]} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Medical Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <View style={styles.bloodTypeGrid}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.bloodTypeButton,
                    bloodType === type && styles.bloodTypeButtonActive,
                  ]}
                  onPress={() => setBloodType(type)}
                >
                  <Icon name="water-outline" size={16} color={bloodType === type ? '#ef4444' : '#64748b'} style={styles.bloodTypeIcon} />
                  <Text
                    style={[
                      styles.bloodTypeText,
                      bloodType === type && styles.bloodTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.inputWrapper}>
                <Icon name="resize-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="170"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text style={styles.inputUnit}>cm</Text>
              </View>
            </View>

            <View style={styles.inputHalf}>
              <Text style={styles.label}>Weight</Text>
              <View style={styles.inputWrapper}>
                <Icon name="scale-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Icon name="warning-outline" size={20} color={colors.primary[600]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Icon name="save-outline" size={20} color={colors.surface} style={styles.saveButtonIcon} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
