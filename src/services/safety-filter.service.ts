// Safety Filter Service for Medical Chatbot
// Ensures medical disclaimers and safety measures in all responses

import { 
  AIResponse, 
  InteractionWarning, 
  ISafetyFilter 
} from '../types/chatbot.types';
import { MEDICAL_DISCLAIMERS } from '../config/environment';

export class SafetyFilterService implements ISafetyFilter {
  
  // Safety-critical topics that require special handling
  private readonly safetyCriticalTopics = [
    // Medical procedures
    'surgery', 'operation', 'surgical',
    
    // Serious conditions
    'cancer', 'tumor', 'heart disease',
    'diabetes', 'hypertension', 'kidney',
    
    // Mental health
    'depression', 'suicide', 'self harm',
    'anxiety', 'panic',
    
    // Pregnancy and pediatrics
    'pregnancy', 'birth', 'baby', 'pediatric',
    
    // Medications and treatments
    'medication dose', 'treatment', 'prescription',
    
    // Emergency situations
    'emergency', 'death', 'unconscious'
  ];

  // Drug interaction database (simplified)
  private readonly drugInteractions = [
    {
      drugs: ['aspirin'],
      interactsWith: ['warfarin', 'coumadin'],
      severity: 'severe' as const,
      description: 'Significantly increases bleeding risk',
      recommendation: 'Do not use together without consulting your doctor'
    },
    {
      drugs: ['metformin'],
      interactsWith: ['alcohol'],
      severity: 'moderate' as const,
      description: 'May increase lactic acidosis risk',
      recommendation: 'Limit alcohol consumption or consult your doctor'
    },
    {
      drugs: ['simvastatin', 'atorvastatin'],
      interactsWith: ['amlodipine'],
      severity: 'mild' as const,
      description: 'May increase muscle pain and rhabdomyolysis risk',
      recommendation: 'Inform your doctor immediately if you experience muscle pain'
    },
    {
      drugs: ['paracetamol', 'acetaminophen'],
      interactsWith: ['alcohol'],
      severity: 'severe' as const,
      description: 'Increases liver damage risk',
      recommendation: 'Do not take paracetamol while using alcohol'
    },
    {
      drugs: ['ibuprofen', 'diclofenac', 'naproxen'],
      interactsWith: ['ace inhibitor', 'lisinopril', 'enalapril'],
      severity: 'moderate' as const,
      description: 'May affect kidney function',
      recommendation: 'Regularly monitor your kidney function'
    }
  ];

  /**
   * Filter AI response and add appropriate disclaimers
   */
  filterResponse(response: AIResponse, messageType: string): AIResponse {
    try {
      let filteredContent = response.content;

      // Only add disclaimers when truly needed (emergency, medication, diagnosis)
      // Don't add for every response
      const needsDisclaimer = response.emergencyDetected || 
                             messageType === 'emergency' || 
                             messageType === 'medication_reminder' ||
                             filteredContent.toLowerCase().includes('prescribe') ||
                             filteredContent.toLowerCase().includes('diagnosis');

      if (needsDisclaimer) {
        // Add safety prioritization only for critical cases
        if (response.emergencyDetected) {
          filteredContent = this.prioritizeSafety(filteredContent);
        }
        filteredContent = this.addAppropriateDisclaimer(filteredContent, messageType, response);
      } else if (response.requiresDisclaimer) {
        // Only add general disclaimer if response explicitly requires it
        filteredContent = this.addAppropriateDisclaimer(filteredContent, messageType, response);
      }

      // Ensure emergency responses are properly formatted
      if (response.emergencyDetected) {
        filteredContent = this.formatEmergencyResponse(filteredContent);
      }

      // Filter out potentially harmful advice
      filteredContent = this.removeHarmfulAdvice(filteredContent);

      return {
        ...response,
        content: filteredContent,
        requiresDisclaimer: needsDisclaimer || response.requiresDisclaimer, // Only require if needed
      };
    } catch (error: any) {
      console.error('SafetyFilter filterResponse error:', error);
      
      // Return safe fallback response
      return {
        content: `Response filtered for safety reasons. ${MEDICAL_DISCLAIMERS.GENERAL}`,
        confidence: 0,
        requiresDisclaimer: true,
        emergencyDetected: false,
        healthDataUsed: [],
      };
    }
  }

  /**
   * Add medical disclaimer to content
   */
  addMedicalDisclaimer(content: string): string {
    // Don't add duplicate disclaimers
    if (content.includes('⚠️') || content.includes('This information is for general')) {
      return content;
    }

    return `${content}\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  /**
   * Detect safety-critical topics in message or response
   */
  detectSafetyCriticalTopics(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    return this.safetyCriticalTopics.some(topic => 
      lowerText.includes(topic.toLowerCase())
    );
  }

  /**
   * Check for medication interactions
   */
  checkMedicationInteractions(medications: string[]): InteractionWarning[] {
    const interactions: InteractionWarning[] = [];
    
    if (medications.length < 2) {
      return interactions;
    }

    // Check each medication against interaction database
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();
        
        // Find interactions
        const interaction = this.drugInteractions.find(drugInteraction => {
          const drugs = drugInteraction.drugs.map(d => d.toLowerCase());
          const interacts = drugInteraction.interactsWith.map(d => d.toLowerCase());
          
          return (
            (drugs.some(drug => med1.includes(drug)) && interacts.some(drug => med2.includes(drug))) ||
            (drugs.some(drug => med2.includes(drug)) && interacts.some(drug => med1.includes(drug)))
          );
        });
        
        if (interaction) {
          interactions.push({
            medicationA: medications[i],
            medicationB: medications[j],
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation,
          });
        }
      }
    }

    return interactions;
  }

  /**
   * Format medication interaction warnings
   */
  formatInteractionWarnings(interactions: InteractionWarning[]): string {
    if (interactions.length === 0) {
      return '';
    }

    let warning = '\n\n⚠️ **MEDICATION INTERACTION WARNING**\n\n';
    
    interactions.forEach((interaction) => {
      const severityIcon = this.getSeverityIcon(interaction.severity);
      warning += `${severityIcon} **${interaction.medicationA}** ↔ **${interaction.medicationB}**\n`;
      warning += `${interaction.description}\n`;
      warning += `**Recommendation:** ${interaction.recommendation}\n\n`;
    });

    warning += MEDICAL_DISCLAIMERS.INTERACTION;
    
    return warning;
  }

  // Private helper methods

  /**
   * Add appropriate disclaimer based on content type
   */
  private addAppropriateDisclaimer(content: string, messageType: string, response: AIResponse): string {
    let disclaimer = '';

    // Choose appropriate disclaimer
    if (response.emergencyDetected) {
      disclaimer = MEDICAL_DISCLAIMERS.EMERGENCY;
    } else if (messageType === 'medication_reminder' || content.toLowerCase().includes('medication')) {
      disclaimer = MEDICAL_DISCLAIMERS.MEDICATION;
    } else if (content.toLowerCase().includes('diagnosis')) {
      disclaimer = MEDICAL_DISCLAIMERS.DIAGNOSIS;
    } else {
      disclaimer = MEDICAL_DISCLAIMERS.GENERAL;
    }

    // Add disclaimer if not already present
    if (!content.includes(disclaimer)) {
      return `${content}\n\n${disclaimer}`;
    }

    return content;
  }

  /**
   * Prioritize safety in response content
   */
  private prioritizeSafety(content: string): string {
    // Only add safety emphasis for truly critical topics (emergency, serious conditions)
    // Don't add for every safety-critical topic
    const criticalPhrases = ['emergency', '911', 'call immediately', 'serious', 'critical', 'life-threatening'];
    const lowerContent = content.toLowerCase();
    
    const isTrulyCritical = criticalPhrases.some(phrase => lowerContent.includes(phrase));
    
    if (isTrulyCritical) {
      const safetyNote = '\n\n';
      
      if (!content.includes(safetyNote)) {
        return content + safetyNote;
      }
    }

    return content;
  }

  /**
   * Format emergency response with proper emphasis
   */
  private formatEmergencyResponse(content: string): string {
    // Ensure emergency responses are properly formatted
    if (!content.includes('🚨') && !content.includes('EMERGENCY')) {
      return `🚨 **EMERGENCY** 🚨\n\n${content}`;
    }

    return content;
  }

  /**
   * Remove potentially harmful advice
   */
  private removeHarmfulAdvice(content: string): string {
    // List of harmful phrases to filter out
    const harmfulPhrases = [
      'treat yourself',
      'no need to see a doctor',
      'you can take these medications',
      'i diagnose',
      'you definitely have this disease',
      'surgery is not needed',
      'stop taking medication',
      'increase the dose',
      'decrease the dose'
    ];

    let filteredContent = content;
    
    harmfulPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      filteredContent = filteredContent.replace(regex, '[Removed for safety reasons]');
    });

    // If harmful content was removed, add explanation
    if (filteredContent !== content) {
      filteredContent += '\n\n⚠️ Some recommendations have been removed for your safety. Please consult a healthcare professional.';
    }

    return filteredContent;
  }

  /**
   * Get severity icon for interaction warnings
   */
  private getSeverityIcon(severity: InteractionWarning['severity']): string {
    switch (severity) {
      case 'severe':
        return '🔴';
      case 'moderate':
        return '🟡';
      case 'mild':
        return '🟢';
      default:
        return '⚠️';
    }
  }

  /**
   * Validate response safety
   */
  validateResponseSafety(response: AIResponse): boolean {
    try {
      const content = response.content.toLowerCase();
      
      // Check for prohibited content
      const prohibitedPhrases = [
        'i diagnose',
        'definitely this disease',
        'surgery is not needed',
        'you can stop medication',
        'don\'t see a doctor'
      ];

      const hasProhibitedContent = prohibitedPhrases.some(phrase => 
        content.includes(phrase)
      );

      if (hasProhibitedContent) {
        console.warn('Response contains prohibited medical advice');
        return false;
      }

      // Check if emergency situations have appropriate disclaimers
      if (response.emergencyDetected && !content.includes('911')) {
        console.warn('Emergency response missing emergency contact information');
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('SafetyFilter validateResponseSafety error:', error);
      return false;
    }
  }

  /**
   * Generate safe fallback response
   */
  generateSafeFallbackResponse(_originalMessage: string): AIResponse {
    return {
      content: `I cannot provide detailed information on this topic for your safety. Please consult a healthcare professional.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`,
      confidence: 0.5,
      requiresDisclaimer: true,
      emergencyDetected: false,
      healthDataUsed: [],
      suggestedActions: [
        'Consult your doctor',
        'Seek medical care',
        'Call 911 in case of emergency'
      ],
    };
  }
}

// Export singleton instance
export const safetyFilterService = new SafetyFilterService();