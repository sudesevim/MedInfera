// Health Data Integration Service for Medical Chatbot
// Integrates with existing MedInfera health data to provide context for AI responses

import { firestoreService, HealthHistoryData, Medication as ExistingMedication } from './firestore.service';
import { 
  HealthContext, 
  Medication, 
  VitalSigns, 
  Symptom, 
  IHealthDataService 
} from '../types/chatbot.types';
import { HealthEntry } from '../components/health/types';

export class HealthDataService implements IHealthDataService {
  
  /**
   * Get comprehensive health context for a user
   */
  async getUserHealthContext(userId: string): Promise<HealthContext> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get all health data from existing service
      const healthData = await firestoreService.getHealthData(userId);
      const medications = await firestoreService.getMedications(userId);
      const userProfile = await firestoreService.getUserProfile(userId);

      // Convert to chatbot format
      const healthContext: HealthContext = {
        userId,
        currentMedications: this.convertMedications(medications),
        recentVitals: this.convertVitalSigns(healthData),
        chronicConditions: this.extractChronicConditions(userProfile),
        allergies: this.extractAllergies(userProfile),
        recentSymptoms: this.convertSymptoms(healthData.symptoms),
        lastUpdated: new Date(),
      };

      return healthContext;
    } catch (error: any) {
      console.error('HealthDataService getUserHealthContext error:', error);
      throw new Error(`Failed to get health context: ${error.message}`);
    }
  }

  /**
   * Get user medications in chatbot format
   */
  async getMedications(userId: string): Promise<Medication[]> {
    try {
      const medications = await firestoreService.getMedications(userId);
      return this.convertMedications(medications);
    } catch (error: any) {
      console.error('HealthDataService getMedications error:', error);
      throw new Error(`Failed to get medications: ${error.message}`);
    }
  }

  /**
   * Get recent vital signs for specified number of days
   */
  async getRecentVitals(userId: string, days: number = 30): Promise<VitalSigns[]> {
    try {
      const healthData = await firestoreService.getHealthData(userId);
      const vitals = this.convertVitalSigns(healthData);
      
      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return vitals.filter(vital => {
        const vitalDate = new Date(vital.date);
        return vitalDate >= cutoffDate;
      });
    } catch (error: any) {
      console.error('HealthDataService getRecentVitals error:', error);
      throw new Error(`Failed to get recent vitals: ${error.message}`);
    }
  }

  /**
   * Get symptom history for specified number of days
   */
  async getSymptomHistory(userId: string, days: number = 30): Promise<Symptom[]> {
    try {
      const symptoms = await firestoreService.getHealthEntriesByType(userId, 'symptoms');
      const convertedSymptoms = this.convertSymptoms(symptoms);
      
      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return convertedSymptoms.filter(symptom => {
        const symptomDate = new Date(symptom.date);
        return symptomDate >= cutoffDate;
      });
    } catch (error: any) {
      console.error('HealthDataService getSymptomHistory error:', error);
      throw new Error(`Failed to get symptom history: ${error.message}`);
    }
  }

  /**
   * Get health summary for AI context
   */
  async getHealthSummary(userId: string): Promise<string> {
    try {
      const healthContext = await this.getUserHealthContext(userId);
      
      const summary = [];
      
      // Add medications
      if (healthContext.currentMedications.length > 0) {
        const medNames = healthContext.currentMedications.map(med => med.name).join(', ');
        summary.push(`Current medications: ${medNames}`);
      }
      
      // Add chronic conditions
      if (healthContext.chronicConditions.length > 0) {
        summary.push(`Chronic conditions: ${healthContext.chronicConditions.join(', ')}`);
      }
      
      // Add allergies
      if (healthContext.allergies.length > 0) {
        summary.push(`Allergies: ${healthContext.allergies.join(', ')}`);
      }
      
      // Add recent symptoms
      if (healthContext.recentSymptoms.length > 0) {
        const recentSymptomNames = healthContext.recentSymptoms
          .slice(0, 3) // Last 3 symptoms
          .map(symptom => symptom.name)
          .join(', ');
        summary.push(`Recent symptoms: ${recentSymptomNames}`);
      }
      
      // Add recent vitals
      if (healthContext.recentVitals.length > 0) {
        const recentVitals = healthContext.recentVitals
          .slice(0, 3) // Last 3 vitals
          .map(vital => `${this.getVitalDisplayName(vital.type)}: ${vital.value} ${vital.unit}`)
          .join(', ');
        summary.push(`Recent measurements: ${recentVitals}`);
      }
      
      return summary.length > 0 
        ? summary.join('. ') 
        : 'No health history information available.';
        
    } catch (error: any) {
      console.error('HealthDataService getHealthSummary error:', error);
      return 'Health information could not be retrieved.';
    }
  }

  /**
   * Check if user has complete health profile
   */
  async hasCompleteHealthProfile(userId: string): Promise<boolean> {
    try {
      const healthContext = await this.getUserHealthContext(userId);
      
      // Check if user has basic health information
      const hasBasicInfo = healthContext.currentMedications.length > 0 ||
                          healthContext.chronicConditions.length > 0 ||
                          healthContext.allergies.length > 0 ||
                          healthContext.recentVitals.length > 0;
      
      return hasBasicInfo;
    } catch (error: any) {
      console.error('HealthDataService hasCompleteHealthProfile error:', error);
      return false;
    }
  }

  // Private helper methods

  /**
   * Convert existing medications to chatbot format
   */
  private convertMedications(medications: ExistingMedication[]): Medication[] {
    return medications.map(med => ({
      id: med.id,
      name: med.name,
      type: med.type,
      dosage: med.dosage,
      frequency: med.days, // Map 'days' to 'frequency'
      startDate: med.startDate || '',
      instructions: `${med.dosage} - ${med.days}`,
      createdAt: med.createdAt,
      updatedAt: med.updatedAt,
    }));
  }

  /**
   * Convert health entries to vital signs
   */
  private convertVitalSigns(healthData: HealthHistoryData): VitalSigns[] {
    const vitals: VitalSigns[] = [];
    
    // Blood pressure
    healthData.bloodPressure?.forEach(entry => {
      vitals.push({
        type: 'blood_pressure',
        value: entry.value,
        unit: 'mmHg',
        date: entry.date,
      });
    });
    
    // Heart rate (pulse)
    healthData.pulse?.forEach(entry => {
      vitals.push({
        type: 'heart_rate',
        value: entry.value,
        unit: 'bpm',
        date: entry.date,
      });
    });
    
    // Temperature
    healthData.temperature?.forEach(entry => {
      vitals.push({
        type: 'temperature',
        value: entry.value,
        unit: '°C',
        date: entry.date,
      });
    });
    
    // Weight
    healthData.weight?.forEach(entry => {
      vitals.push({
        type: 'weight',
        value: entry.value,
        unit: 'kg',
        date: entry.date,
      });
    });
    
    // Blood sugar
    healthData.bloodSugar?.forEach(entry => {
      vitals.push({
        type: 'blood_sugar',
        value: entry.value,
        unit: 'mg/dL',
        date: entry.date,
      });
    });
    
    // Sort by date (newest first)
    return vitals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Convert health entries to symptoms
   */
  private convertSymptoms(symptomEntries: HealthEntry[]): Symptom[] {
    return symptomEntries.map(entry => {
      // Parse symptom data (assuming value contains symptom info)
      const symptomData = this.parseSymptomValue(entry.value);
      
      return {
        name: symptomData.name,
        severity: symptomData.severity,
        duration: symptomData.duration || 'Not specified',
        description: symptomData.description,
        date: entry.date,
        bodyPart: symptomData.bodyPart,
      };
    });
  }

  /**
   * Parse symptom value string to extract structured data
   */
  private parseSymptomValue(value: string): {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration?: string;
    description?: string;
    bodyPart?: string;
  } {
    // Simple parsing - in real implementation, this would be more sophisticated
    const parts = value.split(' - ');
    const name = parts[0] || value;
    
    // Determine severity based on keywords
    let severity: 'mild' | 'moderate' | 'severe' = 'mild';
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('severe') || lowerValue.includes('serious')) {
      severity = 'severe';
    } else if (lowerValue.includes('moderate') || lowerValue.includes('uncomfortable')) {
      severity = 'moderate';
    }
    
    return {
      name,
      severity,
      description: parts.length > 1 ? parts.slice(1).join(' - ') : undefined,
    };
  }

  /**
   * Extract chronic conditions from user profile
   */
  private extractChronicConditions(userProfile: any): string[] {
    // This would be extracted from user profile or medical history
    // For now, return empty array - can be enhanced based on actual data structure
    return [];
  }

  /**
   * Extract allergies from user profile
   */
  private extractAllergies(userProfile: any): string[] {
    if (userProfile?.allergies) {
      // Split allergies string by comma or semicolon
      return userProfile.allergies
        .split(/[,;]/)
        .map((allergy: string) => allergy.trim())
        .filter((allergy: string) => allergy.length > 0);
    }
    return [];
  }

  /**
   * Get display name for vital sign type
   */
  private getVitalDisplayName(type: VitalSigns['type']): string {
    const displayNames = {
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      temperature: 'Temperature',
      weight: 'Weight',
      blood_sugar: 'Blood Sugar',
    };
    
    return displayNames[type] || type;
  }

  /**
   * Get medication interaction data (placeholder for future implementation)
   */
  async getMedicationInteractions(medications: string[]): Promise<any[]> {
    // This would integrate with a drug interaction database
    // For now, return empty array
    console.log('Checking interactions for medications:', medications);
    return [];
  }

  /**
   * Add health data entry (for chatbot to suggest tracking)
   */
  async suggestHealthTracking(userId: string, type: string, suggestion: string): Promise<void> {
    try {
      // This could add a suggestion to track specific health metrics
      console.log(`Suggesting ${type} tracking for user ${userId}: ${suggestion}`);
      // Implementation would depend on how suggestions are stored
    } catch (error: any) {
      console.error('HealthDataService suggestHealthTracking error:', error);
    }
  }
}

// Export singleton instance
export const healthDataService = new HealthDataService();