import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { HealthEntry } from '../components/health/types';
import { authService } from '../services/auth.service';
import { firestoreService } from '../services/firestore.service';

interface HealthHistoryData {
  weight: HealthEntry[];
  sleepHours: HealthEntry[];
  waterIntake: HealthEntry[];
  period: HealthEntry[];
  pulse: HealthEntry[];
  bloodPressure: HealthEntry[];
  bloodSugar: HealthEntry[];
  temperature: HealthEntry[];
  steps: HealthEntry[];
  calories: HealthEntry[];
  exercise: HealthEntry[];
  mood: HealthEntry[];
  medications: HealthEntry[];
  symptoms: HealthEntry[];
}

interface HealthDataContextType {
  healthData: HealthHistoryData;
  addHealthEntry: (type: keyof HealthHistoryData, value: string) => void;
  deleteHealthEntry: (type: keyof HealthHistoryData, entryIndex: number) => Promise<void>;
  getLatestEntry: (type: keyof HealthHistoryData) => HealthEntry | null;
  getTodayEntry: (type: keyof HealthHistoryData) => HealthEntry | null;
  getDisplayEntry: (type: keyof HealthHistoryData) => HealthEntry | null;
  getAllLatestEntries: () => { [key: string]: HealthEntry };
  getAllTodayEntries: () => { [key: string]: HealthEntry };
  getAllDisplayEntries: () => { [key: string]: HealthEntry };
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthData, setHealthData] = useState<HealthHistoryData>({
    weight: [],
    sleepHours: [],
    waterIntake: [],
    period: [],
    pulse: [],
    bloodPressure: [],
    bloodSugar: [],
    temperature: [],
    steps: [],
    calories: [],
    exercise: [],
    mood: [],
    medications: [],
    symptoms: [],
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Auth state değişikliklerini dinle
  useEffect(() => {
    const unsubscribeAuth = authService.onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
      const userId = user?.uid || null;
      
      // Kullanıcı değiştiğinde veya çıkış yapıldığında verileri temizle
      setCurrentUserId((prevUserId) => {
        if (prevUserId !== userId) {
          // Kullanıcı değişti, verileri temizle
          setHealthData({
            weight: [],
            sleepHours: [],
            waterIntake: [],
            period: [],
            pulse: [],
            bloodPressure: [],
            bloodSugar: [],
            temperature: [],
            steps: [],
            calories: [],
            exercise: [],
            mood: [],
            medications: [],
            symptoms: [],
          });
        }
        return userId;
      });
    });

    return unsubscribeAuth;
  }, []);

  // Firestore'dan sağlık verilerini yükle
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    // İlk yükleme
    const loadHealthData = async () => {
      try {
        const data = await firestoreService.getHealthData(currentUserId);
        setHealthData(data);
      } catch (error) {
        console.error('Error loading health data:', error);
        // Hata durumunda boş veri set et
        setHealthData({
          weight: [],
          sleepHours: [],
          waterIntake: [],
          period: [],
          pulse: [],
          bloodPressure: [],
          bloodSugar: [],
          temperature: [],
          steps: [],
          calories: [],
          exercise: [],
          mood: [],
          medications: [],
          symptoms: [],
        });
      }
    };

    loadHealthData();

    // Real-time dinleme - sadece mevcut kullanıcı için
    const unsubscribe = firestoreService.subscribeToHealthData(currentUserId, (data) => {
      setHealthData(data);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const isToday = (dateString: string): boolean => {
    try {
      // Parse date string in format "DD/MM/YYYY, HH:MM"
      const [datePart] = dateString.split(', ');
      const [day, month, year] = datePart.split('/');
      
      const now = new Date();
      const entryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      return (
        entryDate.getDate() === now.getDate() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  };

  const addHealthEntry = async (type: keyof HealthHistoryData, value: string) => {
    if (!currentUserId) {
      console.warn('User not authenticated, cannot save health data');
      throw new Error('User not authenticated');
    }

    const newEntry: HealthEntry = {
      value: value.trim(),
      date: getCurrentDate(),
    };

    // Önce local state'i güncelle (optimistic update)
    setHealthData((prev) => ({
      ...prev,
      [type]: [newEntry, ...prev[type]],
    }));

    // Sonra Firestore'a kaydet
    try {
      await firestoreService.addHealthEntry(currentUserId, type, newEntry);
    } catch (error: any) {
      console.error('Error saving health entry:', error);
      // Hata durumunda local state'i geri al
      setHealthData((prev) => ({
        ...prev,
        [type]: prev[type].slice(1), // İlk entry'yi kaldır
      }));
      throw error;
    }
  };

  const getLatestEntry = (type: keyof HealthHistoryData): HealthEntry | null => {
    const entries = healthData[type];
    return entries.length > 0 ? entries[0] : null;
  };

  const getTodayEntry = (type: keyof HealthHistoryData): HealthEntry | null => {
    const entries = healthData[type];
    // Bugünün en son girişini bul
    const todayEntry = entries.find(entry => isToday(entry.date));
    return todayEntry || null;
  };

  // Günlük sıfırlanması gereken tipler (adım, su, uyku, kalori, egzersiz vb.)
  const dailyResetTypes: Array<keyof HealthHistoryData> = [
    'steps',
    'waterIntake',
    'sleepHours',
    'calories',
    'exercise',
    'mood',
  ];

  // Statik tipler (kilo, tansiyon, nabız, kan şekeri, vücut sıcaklığı vb.)
  const staticTypes: Array<keyof HealthHistoryData> = [
    'weight',
    'bloodPressure',
    'pulse',
    'bloodSugar',
    'temperature',
    'period',
    'medications',
    'symptoms',
  ];

  // Gösterim için uygun entry'yi getir (günlük veya statik)
  const getDisplayEntry = (type: keyof HealthHistoryData): HealthEntry | null => {
    if (dailyResetTypes.includes(type)) {
      // Günlük veriler için bugünün verisini göster
      return getTodayEntry(type);
    } else {
      // Statik veriler için en son veriyi göster
      return getLatestEntry(type);
    }
  };

  const getAllLatestEntries = () => {
    const latest: { [key: string]: HealthEntry } = {};
    
    (Object.keys(healthData) as Array<keyof HealthHistoryData>).forEach((key) => {
      const entry = getLatestEntry(key);
      if (entry) {
        latest[key] = entry;
      }
    });

    return latest;
  };

  const getAllTodayEntries = () => {
    const today: { [key: string]: HealthEntry } = {};
    
    (Object.keys(healthData) as Array<keyof HealthHistoryData>).forEach((key) => {
      const entry = getTodayEntry(key);
      if (entry) {
        today[key] = entry;
      }
    });

    return today;
  };

  const getAllDisplayEntries = () => {
    const display: { [key: string]: HealthEntry } = {};
    
    (Object.keys(healthData) as Array<keyof HealthHistoryData>).forEach((key) => {
      const entry = getDisplayEntry(key);
      if (entry) {
        display[key] = entry;
      }
    });

    return display;
  };

  const deleteHealthEntry = async (type: keyof HealthHistoryData, entryIndex: number) => {
    if (!currentUserId) {
      console.warn('User not authenticated, cannot delete health data');
      throw new Error('User not authenticated');
    }

    // Önce local state'den kaldır (optimistic update)
    const entries = healthData[type];
    if (entryIndex < 0 || entryIndex >= entries.length) {
      throw new Error('Invalid entry index');
    }

    const entryToDelete = entries[entryIndex];
    setHealthData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, index) => index !== entryIndex),
    }));

    // Sonra Firestore'dan sil
    try {
      await firestoreService.deleteHealthEntry(currentUserId, type, entryIndex);
    } catch (error: any) {
      console.error('Error deleting health entry:', error);
      // Hata durumunda local state'i geri al
      setHealthData((prev) => ({
        ...prev,
        [type]: [
          ...prev[type].slice(0, entryIndex),
          entryToDelete,
          ...prev[type].slice(entryIndex),
        ],
      }));
      throw error;
    }
  };

  return (
    <HealthDataContext.Provider
      value={{
        healthData,
        addHealthEntry,
        deleteHealthEntry,
        getLatestEntry,
        getTodayEntry,
        getDisplayEntry,
        getAllLatestEntries,
        getAllTodayEntries,
        getAllDisplayEntries,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

