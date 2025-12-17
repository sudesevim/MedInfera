// Conversation Management Service
// Handles conversation archiving, health data detection, and medication scheduling

import { ChatMessage, HealthContext, Medication } from '../types/chatbot.types';
import { chatService, healthDataService } from '../services';
import { environmentConfig } from '../config/environment';

export class ConversationManagerService {
  
  /**
   * Check if user has missing health data and suggest gathering
   */
  async detectMissingHealthData(userId: string, message: string): Promise<string | null> {
    try {
      const healthContext = await healthDataService.getUserHealthContext(userId);
      const missingData = this.analyzeMissingHealthData(healthContext, message);
      
      if (missingData.length > 0) {
        return this.generateHealthDataGatheringPrompt(missingData);
      }
      
      return null;
    } catch (error: any) {
      console.error('ConversationManager detectMissingHealthData error:', error);
      return null;
    }
  }

  /**
   * Generate personalized medication scheduling suggestions
   */
  async generateMedicationSchedule(userId: string, medications: Medication[]): Promise<string> {
    try {
      if (medications.length === 0) {
        return 'No medication information is recorded in the system. Would you like to add your medications?';
      }

      const scheduleText = this.buildMedicationScheduleText(medications);
      const reminders = this.generateMedicationReminders(medications);
      
      return `${scheduleText}\n\n${reminders}`;
    } catch (error: any) {
      console.error('ConversationManager generateMedicationSchedule error:', error);
      return 'Unable to generate medication schedule. Please try again later.';
    }
  }

  /**
   * Archive old messages when conversation exceeds limit
   */
  async archiveOldMessages(userId: string): Promise<void> {
    try {
      const messageCount = await chatService.getMessageCount(userId);
      
      if (messageCount >= environmentConfig.MAX_CONVERSATION_HISTORY) {
        console.log(`Archiving old messages for user ${userId}, current count: ${messageCount}`);
        // The actual archiving is handled in ChatService
        // This method can be used for additional archiving logic if needed
      }
    } catch (error: any) {
      console.error('ConversationManager archiveOldMessages error:', error);
    }
  }

  /**
   * Analyze conversation for health insights
   */
  analyzeConversationForInsights(messages: ChatMessage[]): string[] {
    const insights: string[] = [];
    
    try {
      // Analyze message patterns
      const recentMessages = messages.slice(0, 10); // Last 10 messages
      
      // Check for recurring symptoms
      const symptoms = this.extractSymptomsFromMessages(recentMessages);
      if (symptoms.length > 0) {
        const recurringSymptoms = this.findRecurringSymptoms(symptoms);
        if (recurringSymptoms.length > 0) {
          insights.push(`Recurring symptoms detected: ${recurringSymptoms.join(', ')}. I recommend consulting your doctor.`);
        }
      }
      
      // Check for medication-related questions
      const medicationQuestions = recentMessages.filter(msg => 
        msg.content.toLowerCase().includes('medication')
      );
      
      if (medicationQuestions.length >= 3) {
        insights.push('You frequently ask questions about your medications. You may want to consult your pharmacist.');
      }
      
      // Check for emergency-related messages
      const emergencyMessages = recentMessages.filter(msg => 
        msg.messageType === 'emergency'
      );
      
      if (emergencyMessages.length > 0) {
        insights.push('You have recent emergency-related messages. Monitor your health condition closely.');
      }
      
    } catch (error: any) {
      console.error('ConversationManager analyzeConversationForInsights error:', error);
    }
    
    return insights;
  }

  /**
   * Generate conversation summary for user
   */
  generateConversationSummary(messages: ChatMessage[]): string {
    try {
      if (messages.length === 0) {
        return 'No conversation history yet.';
      }
      
      const totalMessages = messages.length;
      const userMessages = messages.filter(msg => msg.sender === 'user').length;
      const botMessages = messages.filter(msg => msg.sender === 'bot').length;
      const emergencyMessages = messages.filter(msg => msg.messageType === 'emergency').length;
      
      const firstMessage = messages[messages.length - 1];
      const lastMessage = messages[0];
      
      const daysSinceFirst = Math.floor(
        (new Date().getTime() - new Date(firstMessage.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let summary = `📊 **Conversation Summary**\n\n`;
      summary += `• Total messages: ${totalMessages}\n`;
      summary += `• Your messages: ${userMessages}\n`;
      summary += `• Assistant responses: ${botMessages}\n`;
      
      if (emergencyMessages > 0) {
        summary += `• Emergency messages: ${emergencyMessages}\n`;
      }
      
      summary += `• First conversation: ${daysSinceFirst} days ago\n`;
      summary += `• Last message: ${this.formatRelativeTime(lastMessage.timestamp)}`;
      
      return summary;
    } catch (error: any) {
      console.error('ConversationManager generateConversationSummary error:', error);
      return 'Unable to generate conversation summary.';
    }
  }

  // Private helper methods

  /**
   * Analyze missing health data based on conversation context
   */
  private analyzeMissingHealthData(healthContext: HealthContext, message: string): string[] {
    const missing: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Check for medication-related queries without medication data
    if (lowerMessage.includes('medication') && 
        healthContext.currentMedications.length === 0) {
      missing.push('medications');
    }
    
    // Check for symptom-related queries without symptom history
    if (lowerMessage.includes('symptom') && 
        healthContext.recentSymptoms.length === 0) {
      missing.push('symptoms');
    }
    
    // Check for vital signs queries without vital data
    if ((lowerMessage.includes('blood pressure') || lowerMessage.includes('temperature') || 
         lowerMessage.includes('heart rate') || lowerMessage.includes('weight')) && 
        healthContext.recentVitals.length === 0) {
      missing.push('vitals');
    }
    
    // Check for allergy-related queries without allergy data
    if (lowerMessage.includes('allergy') && 
        healthContext.allergies.length === 0) {
      missing.push('allergies');
    }
    
    return missing;
  }

  /**
   * Generate health data gathering prompt
   */
  private generateHealthDataGatheringPrompt(missingData: string[]): string {
    let prompt = '📋 **For Better Assistance**\n\n';
    prompt += 'To provide you with more personalized help, you can add the following information:\n\n';
    
    if (missingData.includes('medications')) {
      prompt += '• 💊 Your current medications\n';
    }
    
    if (missingData.includes('symptoms')) {
      prompt += '• 🩺 Your recent symptoms\n';
    }
    
    if (missingData.includes('vitals')) {
      prompt += '• 📊 Your vital signs (blood pressure, temperature, heart rate)\n';
    }
    
    if (missingData.includes('allergies')) {
      prompt += '• ⚠️ Your allergies\n';
    }
    
    prompt += '\nYou can add this information from the main app or tell me about it.';
    
    return prompt;
  }

  /**
   * Build medication schedule text
   */
  private buildMedicationScheduleText(medications: Medication[]): string {
    let scheduleText = '💊 **Your Medication Schedule**\n\n';
    
    medications.forEach((med, index) => {
      scheduleText += `${index + 1}. **${med.name}**\n`;
      scheduleText += `   • Dose: ${med.dosage}\n`;
      scheduleText += `   • Frequency: ${med.frequency}\n`;
      
      if (med.instructions) {
        scheduleText += `   • Instructions: ${med.instructions}\n`;
      }
      
      scheduleText += '\n';
    });
    
    return scheduleText;
  }

  /**
   * Generate medication reminders
   */
  private generateMedicationReminders(medications: Medication[]): string {
    let reminders = '⏰ **Reminders**\n\n';
    
    // Generate time-based reminders based on frequency
    medications.forEach(med => {
      const frequency = med.frequency.toLowerCase();
      let reminderText = '';
      
      if (frequency.includes('daily') || frequency.includes('once a day')) {
        reminderText = 'Take at the same time every day';
      } else if (frequency.includes('twice') || frequency.includes('2 times')) {
        reminderText = 'Take every 12 hours (e.g., 08:00 - 20:00)';
      } else if (frequency.includes('three times') || frequency.includes('3 times')) {
        reminderText = 'Take every 8 hours (e.g., 08:00 - 16:00 - 24:00)';
      } else if (frequency.includes('as needed') || frequency.includes('prn')) {
        reminderText = 'Take only as needed';
      } else {
        reminderText = 'Take as recommended by your doctor';
      }
      
      reminders += `• **${med.name}**: ${reminderText}\n`;
    });
    
    reminders += '\n💡 Ask your doctor whether to take your medications with food or on an empty stomach.';
    
    return reminders;
  }

  /**
   * Extract symptoms from messages
   */
  private extractSymptomsFromMessages(messages: ChatMessage[]): string[] {
    const symptoms: string[] = [];
    const symptomKeywords = [
      'pain', 'headache', 'abdominal pain',
      'fever', 'nausea', 'vomiting',
      'cough', 'shortness of breath'
    ];
    
    messages.forEach(message => {
      if (message.sender === 'user') {
        const content = message.content.toLowerCase();
        symptomKeywords.forEach(keyword => {
          if (content.includes(keyword) && !symptoms.includes(keyword)) {
            symptoms.push(keyword);
          }
        });
      }
    });
    
    return symptoms;
  }

  /**
   * Find recurring symptoms
   */
  private findRecurringSymptoms(symptoms: string[]): string[] {
    // Simple implementation - in real app, this would be more sophisticated
    const symptomCounts: { [key: string]: number } = {};
    
    symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    
    return Object.keys(symptomCounts).filter(symptom => symptomCounts[symptom] > 1);
  }

  /**
   * Format relative time
   */
  private formatRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  }
}

// Export singleton instance
export const conversationManagerService = new ConversationManagerService();