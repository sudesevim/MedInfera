import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../../services/auth.service';
import { useHealthData } from '../../contexts/HealthDataContext';
import { colors } from '../../theme';
import { styles } from './HomeScreen.styles';

type HomeStackParamList = {
  HomeMain: undefined;
  Symptoms: undefined;
};

type TabParamList = {
  Home: HomeStackParamList;
  Health: { screen: string };
  Profile: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<TabParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = authService.getCurrentUser();
  const { getLatestEntry, healthData } = useHealthData();
  const [showAllActivities, setShowAllActivities] = useState(false);

  const healthMetrics = [
    { key: 'weight', icon: 'scale-outline', label: 'Weight', unit: 'kg', color: '#9333ea' },
    { key: 'sleepHours', icon: 'moon-outline', label: 'Sleep', unit: '', color: '#3b82f6' },
    { key: 'waterIntake', icon: 'water-outline', label: 'Water', unit: 'L', color: '#06b6d4' },
    { key: 'pulse', icon: 'heart-outline', label: 'Heart Rate', unit: 'bpm', color: '#ef4444' },
    { key: 'bloodPressure', icon: 'pulse-outline', label: 'BP', unit: '', color: '#f59e0b' },
    { key: 'steps', icon: 'walk-outline', label: 'Steps', unit: '', color: '#10b981' },
  ];

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      )}
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="dark-content" />
      )}
      {Platform.OS === 'ios' ? (
        <SafeAreaView style={styles.safeArea} />
      ) : (
        <View style={styles.statusBarSpacer} />
      )}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'there'}! 👋</Text>
            <Text style={styles.subtitle}>How are you feeling today?</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Today's Health Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Today's Health Summary</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric) => {
              const entry = getLatestEntry(metric.key as any);
              return (
                <View key={metric.key} style={styles.metricCard}>
                  <Icon name={metric.icon} size={28} color={metric.color} style={styles.metricIcon} />
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  {entry ? (
                    <Text style={[styles.metricValue, { color: metric.color }]}>
                      {entry.value} {metric.unit}
                    </Text>
                  ) : (
                    <Text style={styles.metricEmpty}>--</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Symptoms')}
          >
            <Icon name="medical-outline" size={32} color={colors.primary[600]} style={styles.actionIcon} />
            <Text style={styles.actionTitle}>Check Symptoms</Text>
            <Text style={styles.actionDescription}>Symptom screening</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Health', { screen: 'HealthStats' })}
          >
            <Icon name="stats-chart-outline" size={32} color={colors.primary[600]} style={styles.actionIcon} />
            <Text style={styles.actionTitle}>Health Stats</Text>
            <Text style={styles.actionDescription}>View your data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {(() => {
            // Activity type definitions with icons and labels
            const activityTypes: { [key: string]: { icon: string; label: string; color: string; unit?: string } } = {
              weight: { icon: 'scale-outline', label: 'Weight', color: '#9333ea', unit: 'kg' },
              sleepHours: { icon: 'moon-outline', label: 'Sleep', color: '#3b82f6', unit: 'h' },
              waterIntake: { icon: 'water-outline', label: 'Water', color: '#06b6d4', unit: 'L' },
              pulse: { icon: 'heart-outline', label: 'Heart Rate', color: '#ef4444', unit: 'bpm' },
              bloodPressure: { icon: 'pulse-outline', label: 'Blood Pressure', color: '#f59e0b' },
              bloodSugar: { icon: 'water-outline', label: 'Blood Sugar', color: '#ec4899', unit: 'mg/dL' },
              temperature: { icon: 'thermometer-outline', label: 'Temperature', color: '#ef4444', unit: '°C' },
              steps: { icon: 'walk-outline', label: 'Steps', color: '#10b981' },
              calories: { icon: 'flame-outline', label: 'Calories', color: '#f97316', unit: 'kcal' },
              exercise: { icon: 'fitness-outline', label: 'Exercise', color: colors.primary[600] },
              mood: { icon: 'happy-outline', label: 'Mood', color: '#f59e0b' },
              medications: { icon: 'medical-outline', label: 'Medication', color: '#ef4444' },
              symptoms: { icon: 'medical-outline', label: 'Symptom', color: '#f59e0b' },
              period: { icon: 'flower-outline', label: 'Menstrual Cycle', color: '#ec4899' },
            };

            // Collect all entries with their types
            const allActivities: Array<{ type: string; entry: any; config: any }> = [];
            
            Object.keys(healthData).forEach((type) => {
              const entries = healthData[type as keyof typeof healthData];
              const config = activityTypes[type];
              
              if (config && entries && entries.length > 0) {
                entries.forEach((entry) => {
                  allActivities.push({ type, entry, config });
                });
              }
            });

            // Sort by date (most recent first)
            allActivities.sort((a, b) => {
              const dateA = new Date(a.entry.date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$1-$2T$4:$5'));
              const dateB = new Date(b.entry.date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$1-$2T$4:$5'));
              return dateB.getTime() - dateA.getTime();
            });

            if (allActivities.length === 0) {
              return (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>
                    No recent activity yet
                  </Text>
                </View>
              );
            }

            // Show first 4 activities, or all if showAllActivities is true
            const displayedActivities = showAllActivities 
              ? allActivities 
              : allActivities.slice(0, 4);
            const hasMore = allActivities.length > 4;

            return (
              <View>
                {displayedActivities.map((activity, index) => {
                  const { type, entry, config } = activity;
                  const displayValue = config.unit 
                    ? `${entry.value} ${config.unit}` 
                    : entry.value;
                  
                  return (
                    <View key={`${type}-${index}-${entry.date}`} style={styles.activityItem}>
                      <Icon name={config.icon} size={32} color={config.color} style={styles.activityIcon} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>{config.label}</Text>
                        <Text style={styles.activityValue}>{displayValue}</Text>
                        <Text style={styles.activityTime}>{entry.date}</Text>
                      </View>
                    </View>
                  );
                })}
                {hasMore && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowAllActivities(!showAllActivities)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllActivities ? 'Show Less' : `Show More (${allActivities.length - 4} more)`}
                    </Text>
                    <Icon 
                      name={showAllActivities ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={colors.primary[600]} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
};
