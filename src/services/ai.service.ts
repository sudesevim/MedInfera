// AI Service Integration for Medical Chatbot
// Handles AI response generation with health context and safety measures

import { 
  AIResponse, 
  HealthContext, 
  EmergencyAssessment, 
  InteractionWarning, 
  IAIService 
} from '../types/chatbot.types';
import { environmentConfig, MEDICAL_DISCLAIMERS, AI_SERVICE_CONFIG } from '../config/environment';
import { pythonBackendService } from './python-backend.service';

export class AIService implements IAIService {
  
  /**
   * Generate AI response based on user message and health context
   */
  async generateResponse(message: string, context: HealthContext): Promise<AIResponse> {
    try {
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      // Check AI service provider
      switch (environmentConfig.AI_SERVICE_PROVIDER) {
        case 'python-backend':
          try {
            return await pythonBackendService.generateResponse(message, context);
          } catch (error) {
            console.warn('Python backend failed, falling back to direct Ollama:', error);
            return await this.generateOllamaResponse(message, context);
          }
        case 'ollama':
          return await this.generateOllamaResponse(message, context);
        case 'mock':
          return await this.generateMockResponse(message, context);
        default:
          // Default to Python backend with fallbacks
          try {
            return await pythonBackendService.generateResponse(message, context);
          } catch (error) {
            console.warn('Python backend failed, falling back to Ollama:', error);
            try {
              return await this.generateOllamaResponse(message, context);
            } catch (ollamaError) {
              console.warn('Ollama also failed, using mock response:', ollamaError);
              return await this.generateMockResponse(message, context);
            }
          }
      }
    } catch (error: any) {
      console.error('AIService generateResponse error:', error);
      
      // Return fallback response on error
      return {
        content: 'I\'m sorry, I\'m unable to respond at the moment. Please try again later or call 911 in case of emergency.',
        confidence: 0,
        requiresDisclaimer: true,
        emergencyDetected: false,
        healthDataUsed: [],
        suggestedActions: ['Try again later', 'Call 911 in case of emergency'],
      };
    }
  }

  /**
   * Detect emergency situations in user message
   */
  async detectEmergency(message: string): Promise<EmergencyAssessment> {
    try {
      // Use Python backend for emergency detection if available
      if (environmentConfig.AI_SERVICE_PROVIDER === 'python-backend') {
        try {
          return await pythonBackendService.detectEmergency(message);
        } catch (error) {
          console.warn('Python backend emergency detection failed, using local detection:', error);
        }
      }

      // Fallback to local emergency detection
      const lowerMessage = message.toLowerCase();
      
      // Emergency keywords and patterns
      const criticalKeywords = [
        'heart attack', 'can\'t breathe', 'chest pain', 'unconscious',
        'stroke', 'paralysis', 'severe headache', 'vomiting blood', 'high fever'
      ];
      
      const highSeverityKeywords = [
        'severe pain', 'difficulty breathing', 'fainting', 'abdominal pain',
        'fracture', 'bleeding', 'poisoning', 'allergy'
      ];
      
      const mediumSeverityKeywords = [
        'fever', 'nausea', 'vomiting', 'headache', 'abdominal pain', 'diarrhea'
      ];

      // Check for critical emergency
      const criticalMatch = criticalKeywords.some(keyword => lowerMessage.includes(keyword));
      if (criticalMatch) {
        return {
          isEmergency: true,
          severity: 'critical',
          symptoms: this.extractSymptoms(message, criticalKeywords),
          recommendedActions: [
            'Call 911 immediately',
            'Go to the nearest emergency room',
            'Try to stay calm',
            'Have someone with you if possible'
          ],
        };
      }

      // Check for high severity
      const highMatch = highSeverityKeywords.some(keyword => lowerMessage.includes(keyword));
      if (highMatch) {
        return {
          isEmergency: true,
          severity: 'high',
          symptoms: this.extractSymptoms(message, highSeverityKeywords),
          recommendedActions: [
            'Seek emergency care',
            'Monitor your condition closely',
            'Call 911 if symptoms worsen'
          ],
        };
      }

      // Check for medium severity
      const mediumMatch = mediumSeverityKeywords.some(keyword => lowerMessage.includes(keyword));
      if (mediumMatch) {
        return {
          isEmergency: false,
          severity: 'medium',
          symptoms: this.extractSymptoms(message, mediumSeverityKeywords),
          recommendedActions: [
            'Consult your doctor',
            'Monitor your symptoms',
            'Seek emergency care if your condition worsens'
          ],
        };
      }

      // No emergency detected
      return {
        isEmergency: false,
        severity: 'low',
        symptoms: [],
        recommendedActions: [
          'Follow general health recommendations',
          'Schedule regular checkups'
        ],
      };

    } catch (error: any) {
      console.error('AIService detectEmergency error:', error);
      
      // Return conservative assessment on error
      return {
        isEmergency: true,
        severity: 'medium',
        symptoms: ['Unable to assess'],
        recommendedActions: [
          'Consult a healthcare professional for safety',
          'Seek emergency care if your symptoms are serious'
        ],
      };
    }
  }

  /**
   * Check for medication interactions
   */
  async checkMedicationInteractions(medications: string[]): Promise<InteractionWarning[]> {
    try {
      if (medications.length < 2) {
        return [];
      }

      // Use Python backend for medication interactions if available
      if (environmentConfig.AI_SERVICE_PROVIDER === 'python-backend') {
        try {
          return await pythonBackendService.checkMedicationInteractions(medications);
        } catch (error) {
          console.warn('Python backend medication check failed, using local check:', error);
        }
      }

      // Fallback to local medication interaction check

      // Mock interaction database - in real implementation, this would query a drug database
      const knownInteractions = [
        {
          drugs: ['aspirin', 'warfarin'],
          severity: 'severe' as const,
          description: 'May increase bleeding risk',
          recommendation: 'Consult your doctor, dose adjustment may be needed'
        },
        {
          drugs: ['metformin', 'alcohol'],
          severity: 'moderate' as const,
          description: 'May increase lactic acidosis risk',
          recommendation: 'Limit alcohol consumption'
        },
        {
          drugs: ['simvastatin', 'amlodipine'],
          severity: 'mild' as const,
          description: 'May increase muscle pain risk',
          recommendation: 'Inform your doctor if you experience muscle pain'
        }
      ];

      const interactions: InteractionWarning[] = [];
      
      // Check all medication pairs
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i].toLowerCase();
          const med2 = medications[j].toLowerCase();
          
          // Check against known interactions
          const interaction = knownInteractions.find(known => 
            (known.drugs.includes(med1) && known.drugs.includes(med2)) ||
            (known.drugs.some(drug => med1.includes(drug)) && known.drugs.some(drug => med2.includes(drug)))
          );
          
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
    } catch (error: any) {
      console.error('AIService checkMedicationInteractions error:', error);
      return [];
    }
  }

  // Private methods for Ollama AI provider

  /**
   * Generate response using Ollama API
   */
  private async generateOllamaResponse(message: string, context: HealthContext): Promise<AIResponse> {
    try {
      const baseUrl = environmentConfig.OLLAMA_BASE_URL || 'http://localhost:11434';
      const model = environmentConfig.OLLAMA_MODEL || 'llama2';
      
      const prompt = this.buildMedicalPrompt(message, context);
      
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: `You are a medical assistant. Provide safe, accurate, and helpful information in English. Do not diagnose, do not prescribe medications, and always recommend consulting a healthcare professional. Respond only in English.\n\n${prompt}`,
          stream: false,
          options: {
            temperature: AI_SERVICE_CONFIG.OLLAMA.temperature,
            num_predict: AI_SERVICE_CONFIG.OLLAMA.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        // Ollama çalışmıyorsa mock response döndür
        console.warn('Ollama API error, falling back to mock response:', response.status);
        return this.generateMockResponse(message, context);
      }

      const data = await response.json();
      const content = data.response || 'Unable to generate response.';

      return {
        content,
        confidence: 0.8,
        requiresDisclaimer: true,
        emergencyDetected: false,
        healthDataUsed: this.getHealthDataReferences(context),
        suggestedActions: [
          'Consult your doctor',
          'Monitor your symptoms',
          'Schedule regular checkups'
        ],
      };
    } catch (error: any) {
      console.error('Ollama API error:', error);
      // Ollama çalışmıyorsa mock response döndür
      return this.generateMockResponse(message, context);
    }
  }

  /**
   * Generate mock response for development/testing
   */
  private async generateMockResponse(message: string, context: HealthContext): Promise<AIResponse> {
    // Simulate API delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), AI_SERVICE_CONFIG.MOCK.responseDelay));

    const lowerMessage = message.toLowerCase();
    let content = '';
    let emergencyDetected = false;
    const healthDataUsed: string[] = [];

    // Generate contextual response based on message content
    if (lowerMessage.includes('medication')) {
      if (context.currentMedications.length > 0) {
        const medNames = context.currentMedications.map(med => med.name).join(', ');
        content = `Your current medications: ${medNames}. For questions about your medications, please consult your doctor.`;
        healthDataUsed.push('medications');
      } else {
        content = 'No medication information is recorded in the system. Please consult your doctor regarding medication use.';
      }
    } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      if (context.recentVitals.some(vital => vital.type === 'temperature')) {
        const tempVitals = context.recentVitals.filter(vital => vital.type === 'temperature');
        const lastTemp = tempVitals[0];
        content = `Your last temperature reading: ${lastTemp.value}°C (${lastTemp.date}). If your temperature is above 38°C, please consult your doctor.`;
        healthDataUsed.push('temperature');
      } else {
        content = 'I recommend taking your temperature. If it\'s above 38°C, please consult your doctor.';
      }
    } else if (lowerMessage.includes('blood pressure') || lowerMessage.includes('pressure')) {
      if (context.recentVitals.some(vital => vital.type === 'blood_pressure')) {
        const bpVitals = context.recentVitals.filter(vital => vital.type === 'blood_pressure');
        const lastBP = bpVitals[0];
        content = `Your last blood pressure reading: ${lastBP.value} mmHg (${lastBP.date}). Normal values are around 120/80 mmHg.`;
        healthDataUsed.push('blood_pressure');
      } else {
        content = 'I recommend taking your blood pressure. Regular monitoring is important.';
      }
    } else if (lowerMessage.includes('symptom')) {
      if (context.recentSymptoms.length > 0) {
        const symptomNames = context.recentSymptoms.slice(0, 3).map(s => s.name).join(', ');
        content = `Your recent symptoms: ${symptomNames}. If your symptoms persist, please consult your doctor.`;
        healthDataUsed.push('symptoms');
      } else {
        content = 'No symptom information is recorded in the system. If you have any concerns, please consult your doctor.';
      }
    } else if (lowerMessage.includes('emergency')) {
      emergencyDetected = true;
      content = '🚨 If you have an emergency, call 911 immediately or go to the nearest emergency room. I am not sufficient for medical emergencies.';
    } else {
      // General health advice
      content = 'I\'m here to help with your health questions. However, for accurate diagnosis and treatment, always consult a healthcare professional.';
    }

    // Add medical disclaimer
    content += `\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;

    return {
      content,
      confidence: 0.7,
      requiresDisclaimer: true,
      emergencyDetected,
      healthDataUsed,
      suggestedActions: [
        'Consult your doctor',
        'Monitor your symptoms',
        'Schedule regular checkups'
      ],
      followUpQuestions: [
        'Do you have any other questions?',
        'Can you provide more information about your symptoms?'
      ],
    };
  }

  /**
   * Build medical prompt with health context
   */
  private buildMedicalPrompt(message: string, context: HealthContext): string {
    let prompt = `User question: ${message}\n\n`;
    
    // Add health context
    if (context.currentMedications.length > 0) {
      const meds = context.currentMedications.map(med => `${med.name} (${med.dosage})`).join(', ');
      prompt += `Current medications: ${meds}\n`;
    }
    
    if (context.chronicConditions.length > 0) {
      prompt += `Chronic conditions: ${context.chronicConditions.join(', ')}\n`;
    }
    
    if (context.allergies.length > 0) {
      prompt += `Allergies: ${context.allergies.join(', ')}\n`;
    }
    
    if (context.recentSymptoms.length > 0) {
      const symptoms = context.recentSymptoms.slice(0, 3).map(s => s.name).join(', ');
      prompt += `Recent symptoms: ${symptoms}\n`;
    }
    
    prompt += '\nProvide a safe, helpful, and medically appropriate response in English. Do not diagnose, do not prescribe medications, and always recommend consulting a healthcare professional. Respond only in English.';
    
    return prompt;
  }

  /**
   * Extract symptoms from message
   */
  private extractSymptoms(message: string, keywords: string[]): string[] {
    const foundSymptoms: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        foundSymptoms.push(keyword);
      }
    });
    
    return foundSymptoms;
  }

  /**
   * Get health data references used in response
   */
  private getHealthDataReferences(context: HealthContext): string[] {
    const references: string[] = [];
    
    if (context.currentMedications.length > 0) {
      references.push('medications');
    }
    if (context.recentVitals.length > 0) {
      references.push('vitals');
    }
    if (context.recentSymptoms.length > 0) {
      references.push('symptoms');
    }
    if (context.chronicConditions.length > 0) {
      references.push('chronic_conditions');
    }
    if (context.allergies.length > 0) {
      references.push('allergies');
    }
    
    return references;
  }
}

// Export singleton instance
export const aiService = new AIService();