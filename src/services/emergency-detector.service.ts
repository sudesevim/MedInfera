// Emergency Detection Service for Medical Chatbot
// Detects emergency situations and provides immediate guidance

import firestore from '@react-native-firebase/firestore';
import { 
  EmergencyAssessment, 
  EmergencyContact, 
  IEmergencyDetector 
} from '../types/chatbot.types';
import { firestoreService } from './firestore.service';
import { EMERGENCY_CONTACTS, MEDICAL_DISCLAIMERS } from '../config/environment';

export class EmergencyDetectorService implements IEmergencyDetector {
  
  // Emergency symptom patterns with severity levels
  private readonly emergencyPatterns = {
    critical: [
      // Cardiovascular emergencies
      'heart attack', 'chest pain severe',
      'can\'t breathe',
      
      // Neurological emergencies  
      'stroke', 'can\'t speak',
      'facial paralysis', 'unconscious',
      'sudden severe headache',
      
      // Bleeding/trauma
      'vomiting blood', 'hematemesis',
      'severe bleeding', 'accident',
      
      // Poisoning
      'poisoned', 'drug overdose',
      
      // Severe allergic reactions
      'anaphylaxis', 'severe allergy',
      'allergic reaction breathing',
    ],
    
    high: [
      // Respiratory issues
      'shortness of breath', 'asthma attack',
      'coughing blood', 'hemoptysis',
      
      // Severe pain
      'unbearable pain', 'severe pain',
      'severe abdominal pain',
      
      // High fever
      'high fever', '39 degrees', '40 degrees', 'fever 39', 'fever 40',
      
      // Trauma
      'fracture', 'broken bone', 'fell down',
      'head trauma', 'head injury',
      
      // Pregnancy emergencies
      'pregnancy bleeding', 'labor pain',
    ],
    
    medium: [
      // Moderate symptoms
      'fever', 'nausea', 'vomiting',
      'headache', 'abdominal pain',
      'diarrhea', 'constipation',
      'dizziness', 'weakness',
      
      // Mild injuries
      'cut', 'scratch', 'bruise',
      'sprain', 'strain',
    ]
  };

  /**
   * Detect emergency symptoms in user message
   */
  detectEmergencySymptoms(message: string): EmergencyAssessment {
    try {
      const lowerMessage = message.toLowerCase().trim();
      
      if (!lowerMessage) {
        return this.createLowSeverityAssessment();
      }

      // Check for critical emergencies
      const criticalSymptoms = this.findMatchingSymptoms(lowerMessage, this.emergencyPatterns.critical);
      if (criticalSymptoms.length > 0) {
        return {
          isEmergency: true,
          severity: 'critical',
          symptoms: criticalSymptoms,
          recommendedActions: [
            '🚨 CALL 911 IMMEDIATELY',
            'Go to the nearest emergency room',
            'Try to stay calm',
            'Have someone with you if possible',
            'Bring your medications with you'
          ],
          emergencyContacts: [
            EMERGENCY_CONTACTS.GENERAL_EMERGENCY,
            EMERGENCY_CONTACTS.POISON_CONTROL
          ]
        };
      }

      // Check for high severity emergencies
      const highSymptoms = this.findMatchingSymptoms(lowerMessage, this.emergencyPatterns.high);
      if (highSymptoms.length > 0) {
        return {
          isEmergency: true,
          severity: 'high',
          symptoms: highSymptoms,
          recommendedActions: [
            'Seek emergency care',
            'Monitor your condition closely',
            'Call 911 immediately if symptoms worsen',
            'Have someone with you',
            'Have your health history ready'
          ],
          emergencyContacts: [
            EMERGENCY_CONTACTS.GENERAL_EMERGENCY
          ]
        };
      }

      // Check for medium severity
      const mediumSymptoms = this.findMatchingSymptoms(lowerMessage, this.emergencyPatterns.medium);
      if (mediumSymptoms.length > 0) {
        return {
          isEmergency: false,
          severity: 'medium',
          symptoms: mediumSymptoms,
          recommendedActions: [
            'Consult your doctor',
            'Monitor your symptoms',
            'Seek emergency care if your condition worsens',
            'Drink plenty of fluids and rest'
          ]
        };
      }

      // No emergency detected
      return this.createLowSeverityAssessment();

    } catch (error: any) {
      console.error('EmergencyDetector detectEmergencySymptoms error:', error);
      
      // Return conservative assessment on error
      return {
        isEmergency: true,
        severity: 'medium',
        symptoms: ['Unable to assess'],
        recommendedActions: [
          'Consult a healthcare professional for safety',
          'Seek emergency care if your symptoms are serious',
          'Call 911 if in doubt'
        ],
        emergencyContacts: [
          EMERGENCY_CONTACTS.GENERAL_EMERGENCY
        ]
      };
    }
  }

  /**
   * Get emergency contacts for a user
   */
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      // Get user's personal emergency contacts
      const personalContacts = await firestoreService.getEmergencyContacts(userId);
      
      // Add system emergency contacts
      const systemContacts: EmergencyContact[] = [
        {
          name: EMERGENCY_CONTACTS.GENERAL_EMERGENCY.name,
          phone: EMERGENCY_CONTACTS.GENERAL_EMERGENCY.phone,
          relationship: 'Emergency Services',
          isPrimary: true
        },
        {
          name: EMERGENCY_CONTACTS.POISON_CONTROL.name,
          phone: EMERGENCY_CONTACTS.POISON_CONTROL.phone,
          relationship: 'Poison Control',
          isPrimary: false
        }
      ];

      // Combine and prioritize
      return [...systemContacts, ...personalContacts];
    } catch (error: any) {
      console.error('EmergencyDetector getEmergencyContacts error:', error);
      
      // Return system contacts as fallback
      return [
        {
          name: EMERGENCY_CONTACTS.GENERAL_EMERGENCY.name,
          phone: EMERGENCY_CONTACTS.GENERAL_EMERGENCY.phone,
          relationship: 'Emergency Services',
          isPrimary: true
        }
      ];
    }
  }

  /**
   * Log emergency interaction for follow-up
   */
  async logEmergencyInteraction(userId: string, assessment: EmergencyAssessment): Promise<void> {
    try {
      if (!assessment.isEmergency) {
        return; // Only log actual emergencies
      }

      const emergencyLog = {
        userId,
        severity: assessment.severity,
        symptoms: assessment.symptoms,
        recommendedActions: assessment.recommendedActions,
        timestamp: firestore.FieldValue.serverTimestamp(),
        followUpRequired: assessment.severity === 'critical' || assessment.severity === 'high',
        resolved: false,
      };

      // Save to user's emergency logs collection
      const emergencyLogsCollection = firestore()
        .collection('users')
        .doc(userId)
        .collection('emergencyLogs');

      await emergencyLogsCollection.add(emergencyLog);

      console.log(`Emergency interaction logged for user ${userId}, severity: ${assessment.severity}`);
    } catch (error: any) {
      console.error('EmergencyDetector logEmergencyInteraction error:', error);
      // Don't throw here as logging is secondary to emergency response
    }
  }

  /**
   * Generate emergency response message
   */
  generateEmergencyResponse(assessment: EmergencyAssessment): string {
    let response = '';

    switch (assessment.severity) {
      case 'critical':
        response = `🚨 **EMERGENCY DETECTED**\n\n`;
        response += `Detected symptoms: ${assessment.symptoms.join(', ')}\n\n`;
        response += `**IMMEDIATE ACTIONS REQUIRED:**\n`;
        assessment.recommendedActions.forEach((action, index) => {
          response += `${index + 1}. ${action}\n`;
        });
        response += `\n${MEDICAL_DISCLAIMERS.EMERGENCY}`;
        break;

      case 'high':
        response = `⚠️ **SERIOUS SYMPTOMS DETECTED**\n\n`;
        response += `Detected symptoms: ${assessment.symptoms.join(', ')}\n\n`;
        response += `**RECOMMENDED STEPS:**\n`;
        assessment.recommendedActions.forEach((action, index) => {
          response += `${index + 1}. ${action}\n`;
        });
        response += `\n${MEDICAL_DISCLAIMERS.GENERAL}`;
        break;

      case 'medium':
        response = `💡 **HEALTH RECOMMENDATIONS**\n\n`;
        response += `Symptoms you mentioned: ${assessment.symptoms.join(', ')}\n\n`;
        response += `**RECOMMENDATIONS:**\n`;
        assessment.recommendedActions.forEach((action, index) => {
          response += `${index + 1}. ${action}\n`;
        });
        response += `\n${MEDICAL_DISCLAIMERS.GENERAL}`;
        break;

      default:
        response = `I understand your health concerns. `;
        response += `If you have any discomfort, I recommend consulting your doctor.\n\n`;
        response += MEDICAL_DISCLAIMERS.GENERAL;
    }

    return response;
  }

  /**
   * Check if message contains emergency keywords
   */
  containsEmergencyKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const allEmergencyKeywords = [
      ...this.emergencyPatterns.critical,
      ...this.emergencyPatterns.high
    ];
    
    return allEmergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Get emergency contact information formatted for display
   */
  formatEmergencyContacts(contacts: EmergencyContact[]): string {
    if (contacts.length === 0) {
      return 'Emergency: 911';
    }

    let formatted = '**EMERGENCY CONTACT INFORMATION:**\n\n';
    
    contacts.forEach(contact => {
      formatted += `📞 **${contact.name}**: ${contact.phone}`;
      if (contact.relationship) {
        formatted += ` (${contact.relationship})`;
      }
      formatted += '\n';
    });

    return formatted;
  }

  // Private helper methods

  /**
   * Find matching symptoms in message
   */
  private findMatchingSymptoms(message: string, patterns: string[]): string[] {
    const matchedSymptoms: string[] = [];
    
    patterns.forEach(pattern => {
      if (message.includes(pattern.toLowerCase())) {
        // Use English for display
        const displaySymptom = pattern;
        if (!matchedSymptoms.includes(displaySymptom)) {
          matchedSymptoms.push(displaySymptom);
        }
      }
    });

    return matchedSymptoms;
  }


  /**
   * Create low severity assessment
   */
  private createLowSeverityAssessment(): EmergencyAssessment {
    return {
      isEmergency: false,
      severity: 'low',
      symptoms: [],
      recommendedActions: [
        'Follow general health recommendations',
        'Schedule regular checkups',
        'Adopt a healthy lifestyle'
      ]
    };
  }
}

// Export singleton instance
export const emergencyDetectorService = new EmergencyDetectorService();