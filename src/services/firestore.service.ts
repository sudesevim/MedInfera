// Firebase Firestore Service
// Bu dosya Firestore veritabanı işlemlerini yönetir

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { HealthEntry } from '../components/health/types';

export interface UserProfile {
  displayName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HealthHistoryData {
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

export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

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

class FirestoreService {
  private usersCollection = firestore().collection('users');

  // Kimlik doğrulama kontrolü
  private verifyAuth(userId: string): void {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated. Please sign in.');
    }
    if (currentUser.uid !== userId) {
      throw new Error('User ID mismatch. Operation not allowed.');
    }
  }

  // Firestore hata yönetimi
  private handleFirestoreError(error: any, operation: string): Error {
    if (error.code === 'permission-denied' || error.code === 'firestore/permission-denied') {
      return new Error(`Permission denied: You don't have permission to ${operation}. Please ensure you're signed in.`);
    }
    if (error.code === 'unauthenticated' || error.code === 'firestore/unauthenticated') {
      return new Error(`Authentication required: Please sign in to ${operation}.`);
    }
    if (error.message) {
      return new Error(`Failed to ${operation}: ${error.message}`);
    }
    return new Error(`Failed to ${operation}: ${error.code || 'Unknown error'}`);
  }

  // Kullanıcı profilini kaydet veya güncelle
  async saveUserProfile(userId: string, profileData: UserProfile): Promise<void> {
    try {
      this.verifyAuth(userId);
      const userRef = this.usersCollection.doc(userId);
      const existingDoc = await userRef.get();

      const dataToSave: UserProfile = {
        ...profileData,
        updatedAt: new Date(),
      };

      if (existingDoc.exists()) {
        // Mevcut dokümanı güncelle
        await userRef.update(dataToSave);
      } else {
        // Yeni doküman oluştur
        await userRef.set({
          ...dataToSave,
          createdAt: new Date(),
        });
      }
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'save profile');
    }
  }

  // Kullanıcı profilini getir
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      this.verifyAuth(userId);
      const userDoc = await this.usersCollection.doc(userId).get();
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'get profile');
    }
  }

  // Kullanıcı profilini dinle (real-time updates)
  subscribeToUserProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    return this.usersCollection.doc(userId).onSnapshot(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          callback(documentSnapshot.data() as UserProfile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to profile:', error);
        callback(null);
      }
    );
  }

  // Sağlık verileri koleksiyonu
  private getHealthDataCollection(userId: string) {
    return firestore().collection('users').doc(userId).collection('healthData');
  }

  // Sağlık verisi ekle
  async addHealthEntry(
    userId: string,
    type: keyof HealthHistoryData,
    entry: HealthEntry
  ): Promise<void> {
    try {
      this.verifyAuth(userId);
      const healthCollection = this.getHealthDataCollection(userId);
      const typeDoc = healthCollection.doc(type);
      
      // Mevcut verileri al
      const typeDocSnapshot = await typeDoc.get();
      let existingEntries: HealthEntry[] = [];
      
      if (typeDocSnapshot.exists()) {
        const data = typeDocSnapshot.data();
        if (data && data.entries && Array.isArray(data.entries)) {
          existingEntries = data.entries as HealthEntry[];
        }
      }

      // Yeni entry'yi başa ekle
      const updatedEntries = [entry, ...existingEntries];

      // Firestore'a kaydet
      await typeDoc.set({
        entries: updatedEntries,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Firestore addHealthEntry error:', error);
      throw this.handleFirestoreError(error, 'save health entry');
    }
  }

  // Tüm sağlık verilerini getir
  async getHealthData(userId: string): Promise<HealthHistoryData> {
    try {
      this.verifyAuth(userId);
      const healthCollection = this.getHealthDataCollection(userId);
      const snapshot = await healthCollection.get();

      const healthData: Partial<HealthHistoryData> = {
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
      };

      snapshot.forEach((doc) => {
        const type = doc.id as keyof HealthHistoryData;
        const data = doc.data();
        if (data && data.entries && Array.isArray(data.entries)) {
          healthData[type] = data.entries as HealthEntry[];
        }
      });

      return healthData as HealthHistoryData;
    } catch (error: any) {
      console.error('Firestore getHealthData error:', error);
      throw this.handleFirestoreError(error, 'get health data');
    }
  }

  // Belirli bir tip sağlık verisini getir
  async getHealthEntriesByType(
    userId: string,
    type: keyof HealthHistoryData
  ): Promise<HealthEntry[]> {
    try {
      this.verifyAuth(userId);
      const typeDoc = this.getHealthDataCollection(userId).doc(type);
      const docSnapshot = await typeDoc.get();

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        return (data?.entries || []) as HealthEntry[];
      }

      return [];
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'get health entries');
    }
  }

  // Sağlık verisi sil
  async deleteHealthEntry(
    userId: string,
    type: keyof HealthHistoryData,
    entryIndex: number
  ): Promise<void> {
    try {
      this.verifyAuth(userId);
      const healthCollection = this.getHealthDataCollection(userId);
      const typeDoc = healthCollection.doc(type);
      
      // Mevcut verileri al
      const typeDocSnapshot = await typeDoc.get();
      let existingEntries: HealthEntry[] = [];
      
      if (typeDocSnapshot.exists()) {
        const data = typeDocSnapshot.data();
        if (data && data.entries && Array.isArray(data.entries)) {
          existingEntries = data.entries as HealthEntry[];
        }
      }

      // Belirtilen index'teki entry'yi kaldır
      if (entryIndex >= 0 && entryIndex < existingEntries.length) {
        const updatedEntries = existingEntries.filter((_, index) => index !== entryIndex);

        // Firestore'a kaydet
        await typeDoc.set({
          entries: updatedEntries,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        throw new Error('Invalid entry index');
      }
    } catch (error: any) {
      console.error('Firestore deleteHealthEntry error:', error);
      throw this.handleFirestoreError(error, 'delete health entry');
    }
  }

  // Sağlık verilerini dinle (real-time updates)
  subscribeToHealthData(
    userId: string,
    callback: (healthData: HealthHistoryData) => void
  ): () => void {
    const healthCollection = this.getHealthDataCollection(userId);
    
    return healthCollection.onSnapshot(
      (snapshot) => {
        const healthData: Partial<HealthHistoryData> = {
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
        };

        snapshot.forEach((doc) => {
          const type = doc.id as keyof HealthHistoryData;
          const data = doc.data();
          if (data.entries && Array.isArray(data.entries)) {
            healthData[type] = data.entries as HealthEntry[];
          }
        });

        callback(healthData as HealthHistoryData);
      },
      (error) => {
        console.error('Error listening to health data:', error);
        // Hata durumunda boş veri gönder
        callback({
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
    );
  }

  // Emergency Contacts koleksiyonu
  private getEmergencyContactsCollection(userId: string) {
    return firestore().collection('users').doc(userId).collection('emergencyContacts');
  }

  // Emergency Contact ekle
  async addEmergencyContact(
    userId: string,
    contact: EmergencyContact
  ): Promise<string> {
    try {
      this.verifyAuth(userId);
      const contactsCollection = this.getEmergencyContactsCollection(userId);
      const docRef = await contactsCollection.add({
        ...contact,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'add emergency contact');
    }
  }

  // Emergency Contact güncelle
  async updateEmergencyContact(
    userId: string,
    contactId: string,
    contact: Partial<EmergencyContact>
  ): Promise<void> {
    try {
      this.verifyAuth(userId);
      const contactRef = this.getEmergencyContactsCollection(userId).doc(contactId);
      await contactRef.update({
        ...contact,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'update emergency contact');
    }
  }

  // Emergency Contact sil
  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      this.verifyAuth(userId);
      await this.getEmergencyContactsCollection(userId).doc(contactId).delete();
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'delete emergency contact');
    }
  }

  // Tüm Emergency Contacts'leri getir
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      this.verifyAuth(userId);
      const snapshot = await this.getEmergencyContactsCollection(userId).get();
      const contacts: EmergencyContact[] = [];
      
      snapshot.forEach((doc) => {
        contacts.push({
          id: doc.id,
          ...doc.data(),
        } as EmergencyContact);
      });

      // Primary contact'ı önce göster
      return contacts.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'get emergency contacts');
    }
  }

  // Emergency Contacts'leri dinle (real-time updates)
  subscribeToEmergencyContacts(
    userId: string,
    callback: (contacts: EmergencyContact[]) => void
  ): () => void {
    return this.getEmergencyContactsCollection(userId).onSnapshot(
      (snapshot) => {
        const contacts: EmergencyContact[] = [];
        
        snapshot.forEach((doc) => {
          contacts.push({
            id: doc.id,
            ...doc.data(),
          } as EmergencyContact);
        });

        // Primary contact'ı önce göster
        const sortedContacts = contacts.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return 0;
        });

        callback(sortedContacts);
      },
      (error) => {
        console.error('Error listening to emergency contacts:', error);
        callback([]);
      }
    );
  }

  // Symptom Screening koleksiyonu
  private getSymptomScreeningsCollection(userId: string) {
    return firestore().collection('users').doc(userId).collection('symptomScreenings');
  }

  // Symptom Screening kaydet
  async saveSymptomScreening(userId: string, screeningData: any): Promise<string> {
    try {
      this.verifyAuth(userId);
      const screeningsCollection = this.getSymptomScreeningsCollection(userId);
      const docRef = await screeningsCollection.add({
        ...screeningData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'save symptom screening');
    }
  }

  // Medications koleksiyonu
  private getMedicationsCollection(userId: string) {
    return firestore().collection('users').doc(userId).collection('medications');
  }

  // Medication ekle
  async addMedication(userId: string, medication: Medication): Promise<string> {
    try {
      this.verifyAuth(userId);
      const medicationsCollection = this.getMedicationsCollection(userId);
      const docRef = await medicationsCollection.add({
        ...medication,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'add medication');
    }
  }

  // Medication güncelle
  async updateMedication(userId: string, medicationId: string, medication: Partial<Medication>): Promise<void> {
    try {
      this.verifyAuth(userId);
      const medicationRef = this.getMedicationsCollection(userId).doc(medicationId);
      await medicationRef.update({
        ...medication,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'update medication');
    }
  }

  // Medication sil
  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    try {
      this.verifyAuth(userId);
      await this.getMedicationsCollection(userId).doc(medicationId).delete();
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'delete medication');
    }
  }

  // Tüm Medications'ları getir
  async getMedications(userId: string): Promise<Medication[]> {
    try {
      this.verifyAuth(userId);
      const snapshot = await this.getMedicationsCollection(userId).get();
      const medications: Medication[] = [];
      
      snapshot.forEach((doc) => {
        medications.push({
          id: doc.id,
          ...doc.data(),
        } as Medication);
      });

      // En yeni önce sırala
      return medications.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error: any) {
      throw this.handleFirestoreError(error, 'get medications');
    }
  }
}

export const firestoreService = new FirestoreService();


