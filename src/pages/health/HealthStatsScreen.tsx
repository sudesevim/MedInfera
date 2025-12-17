import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHealthData } from '../../contexts/HealthDataContext';
import { colors } from '../../theme';
import { styles } from './HealthStatsScreen.styles';

type HealthStackParamList = {
  HealthHistory: undefined;
  HealthStats: undefined;
};

type HealthStatsScreenNavigationProp = NativeStackNavigationProp<HealthStackParamList, 'HealthStats'>;

export const HealthStatsScreen: React.FC = () => {
  const navigation = useNavigation<HealthStatsScreenNavigationProp>();
  const { healthData } = useHealthData();

  const handleGoBack = () => {
    // Use navigate instead of goBack for more reliable navigation
    navigation.navigate('HealthHistory');
  };

  // Steps için circular progress (8000 hedef) - bugünün tüm girişlerini topla
  const stepsProgress = useMemo(() => {
    if (healthData.steps.length === 0) return { current: 0, percentage: 0 };
    
    // Bugünün tarihini al (sadece gün/ay/yıl)
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    // Bugünün tüm step girişlerini topla
    const todaySteps = healthData.steps.filter(entry => {
      const entryDate = entry.date.split(',')[0]; // "DD/MM/YYYY" kısmını al
      return entryDate === todayStr;
    });
    
    // Bugünün toplam step'lerini hesapla
    const totalSteps = todaySteps.reduce((sum, entry) => {
      return sum + (parseFloat(entry.value) || 0);
    }, 0);
    
    const percentage = Math.min((totalSteps / 8000) * 100, 100);
    return { current: totalSteps, percentage };
  }, [healthData.steps]);


  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      )}
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="light-content" />
      )}
      {/* Custom Header */}
      {Platform.OS === 'ios' ? (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.customHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color={colors.surface} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Stats</Text>
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      ) : (
        <>
          <View style={styles.statusBarSpacer} />
          <View style={styles.customHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color={colors.surface} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Stats</Text>
            <View style={styles.headerRight} />
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Health Statistics</Text>
          <Text style={styles.subtitle}>Track your progress and trends</Text>
        </View>

        {/* Steps Circular Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="walk-outline" size={24} color={colors.primary[600]} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Daily Steps</Text>
          </View>
          
          <View style={styles.circularProgressContainer}>
            {/* Steps display */}
            <View style={styles.stepsDisplay}>
              <Text style={styles.stepsValue}>{Math.round(stepsProgress.current).toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>steps</Text>
              <Text style={styles.stepsTarget}>/ 8,000</Text>
            </View>
            
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${stepsProgress.percentage}%`,
                      backgroundColor: colors.primary[600],
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(stepsProgress.percentage)}% of daily goal
            </Text>
          </View>
        </View>


        {/* Other Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Sleep */}
          {healthData.sleepHours[0] && (
            <View style={styles.statCard}>
              <Icon name="moon-outline" size={32} color={colors.primary[600]} />
              <Text style={styles.statCardValue}>{healthData.sleepHours[0].value}</Text>
              <Text style={styles.statCardLabel}>Hours Sleep</Text>
            </View>
          )}

          {/* Water */}
          {healthData.waterIntake[0] && (
            <View style={styles.statCard}>
              <Icon name="water-outline" size={32} color={colors.primary[600]} />
              <Text style={styles.statCardValue}>{healthData.waterIntake[0].value}</Text>
              <Text style={styles.statCardLabel}>Water (L)</Text>
            </View>
          )}

          {/* Heart Rate */}
          {healthData.pulse[0] && (
            <View style={styles.statCard}>
              <Icon name="heart-outline" size={32} color="#ef4444" />
              <Text style={styles.statCardValue}>{healthData.pulse[0].value}</Text>
              <Text style={styles.statCardLabel}>Heart Rate</Text>
            </View>
          )}

          {/* Calories */}
          {healthData.calories[0] && (
            <View style={styles.statCard}>
              <Icon name="flame-outline" size={32} color="#f97316" />
              <Text style={styles.statCardValue}>{healthData.calories[0].value}</Text>
              <Text style={styles.statCardLabel}>Calories</Text>
            </View>
          )}
        </View>

        {healthData.steps.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="stats-chart-outline" size={64} color={colors.primary[300]} />
            <Text style={styles.emptyStateText}>No data available</Text>
            <Text style={styles.emptyStateSubtext}>Start tracking your health to see statistics</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
