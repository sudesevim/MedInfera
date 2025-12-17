// Error Handler Service
// Centralized error handling and fallback systems for the medical chatbot

import { ChatbotError, ChatbotErrorType } from '../types/chatbot.types';
import { MEDICAL_DISCLAIMERS } from '../config/environment';

interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableFallbacks: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
}

interface FallbackResponse {
  content: string;
  type: 'error' | 'fallback' | 'offline';
  canRetry: boolean;
  retryAfter?: number;
}

export class ErrorHandlerService {
  private config: ErrorHandlerConfig = {
    enableLogging: true,
    enableFallbacks: true,
    maxRetryAttempts: 3,
    retryDelay: 1000,
  };

  private retryAttempts: Map<string, number> = new Map();

  /**
   * Handle and classify errors
   */
  handleError(error: any, context: string): ChatbotError {
    const chatbotError: ChatbotError = {
      code: this.classifyError(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
    };

    if (this.config.enableLogging) {
      this.logError(chatbotError, context);
    }

    return chatbotError;
  }

  /**
   * Get fallback response for different error types
   */
  getFallbackResponse(errorType: ChatbotErrorType, context?: string): FallbackResponse {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return {
          content: this.getNetworkErrorFallback(),
          type: 'offline',
          canRetry: true,
          retryAfter: 5000,
        };

      case 'AI_SERVICE_ERROR':
        return {
          content: this.getAIServiceErrorFallback(),
          type: 'fallback',
          canRetry: true,
          retryAfter: 3000,
        };

      case 'HEALTH_DATA_ERROR':
        return {
          content: this.getHealthDataErrorFallback(),
          type: 'fallback',
          canRetry: true,
        };

      case 'EMERGENCY_DETECTION_ERROR':
        return {
          content: this.getEmergencyDetectionErrorFallback(),
          type: 'error',
          canRetry: false,
        };

      case 'SAFETY_FILTER_ERROR':
        return {
          content: this.getSafetyFilterErrorFallback(),
          type: 'error',
          canRetry: false,
        };

      case 'VALIDATION_ERROR':
        return {
          content: this.getValidationErrorFallback(context),
          type: 'error',
          canRetry: false,
        };

      default:
        return {
          content: this.getGenericErrorFallback(),
          type: 'error',
          canRetry: true,
        };
    }
  }

  /**
   * Check if operation should be retried
   */
  shouldRetry(operationId: string, errorType: ChatbotErrorType): boolean {
    const attempts = this.retryAttempts.get(operationId) || 0;
    
    // Don't retry validation or safety errors
    if (errorType === 'VALIDATION_ERROR' || errorType === 'SAFETY_FILTER_ERROR') {
      return false;
    }

    // Don't retry emergency detection errors
    if (errorType === 'EMERGENCY_DETECTION_ERROR') {
      return false;
    }

    return attempts < this.config.maxRetryAttempts;
  }

  /**
   * Record retry attempt
   */
  recordRetryAttempt(operationId: string): void {
    const attempts = this.retryAttempts.get(operationId) || 0;
    this.retryAttempts.set(operationId, attempts + 1);
  }

  /**
   * Clear retry attempts for successful operation
   */
  clearRetryAttempts(operationId: string): void {
    this.retryAttempts.delete(operationId);
  }

  /**
   * Get retry delay with exponential backoff
   */
  getRetryDelay(operationId: string): number {
    const attempts = this.retryAttempts.get(operationId) || 0;
    return this.config.retryDelay * Math.pow(2, attempts);
  }

  /**
   * Handle network connectivity errors
   */
  handleNetworkError(error: any): FallbackResponse {
    return {
      content: `🌐 **Connection Issue**\n\nPlease check your internet connection and try again.\n\n• Check your WiFi or mobile data\n• Try again in a few seconds\n• If the problem persists, restart the app\n\n${MEDICAL_DISCLAIMERS.GENERAL}`,
      type: 'offline',
      canRetry: true,
      retryAfter: 5000,
    };
  }

  /**
   * Handle AI service failures with graceful degradation
   */
  handleAIServiceFailure(userMessage: string): FallbackResponse {
    // Provide basic responses based on message content
    const lowerMessage = userMessage.toLowerCase();
    let fallbackContent = '';

    if (lowerMessage.includes('emergency')) {
      fallbackContent = `🚨 **EMERGENCY**\n\nThe AI service is currently unavailable, but if you have an emergency:\n\n• Call 911 immediately\n• Go to the nearest emergency room\n• Ask for help from those around you\n\n${MEDICAL_DISCLAIMERS.EMERGENCY}`;
    } else if (lowerMessage.includes('medication')) {
      fallbackContent = `💊 **Medication Information**\n\nThe AI service is temporarily unavailable. Regarding your medications:\n\n• Consult your doctor\n• Speak with your pharmacist\n• Read the medication leaflet\n• Stop use if you experience side effects\n\n${MEDICAL_DISCLAIMERS.MEDICATION}`;
    } else {
      fallbackContent = `🤖 **Temporary Service Interruption**\n\nThe AI assistant is currently unavailable. In the meantime:\n\n• Call 911 in case of emergency\n• Consult your doctor for health questions\n• Try again in a few minutes\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
    }

    return {
      content: fallbackContent,
      type: 'fallback',
      canRetry: true,
      retryAfter: 3000,
    };
  }

  /**
   * Handle health data access errors
   */
  handleHealthDataError(): FallbackResponse {
    return {
      content: `📊 **Health Data Access Issue**\n\nYour health data is currently inaccessible. In this case:\n\n• I can provide general health recommendations\n• Check your data for personalized recommendations\n• Update your health data from the main app\n\n${MEDICAL_DISCLAIMERS.GENERAL}`,
      type: 'fallback',
      canRetry: true,
    };
  }

  /**
   * Create safe emergency fallback
   */
  createEmergencyFallback(): string {
    return `🚨 **EMERGENCY SAFETY PROTOCOL**\n\nFull assessment cannot be performed due to system error.\n\nFOR SAFETY:\n• If you have serious symptoms, call 911 immediately\n• Seek the nearest emergency room\n• If your condition is unclear, consult a healthcare professional\n\n**EMERGENCY CONTACTS:**\n• Emergency Services: 911\n• Poison Control: 1-800-222-1222\n\n${MEDICAL_DISCLAIMERS.EMERGENCY}`;
  }

  // Private helper methods

  /**
   * Classify error type
   */
  private classifyError(error: any): ChatbotErrorType {
    if (error.code) {
      // Firebase errors
      if (error.code.includes('network') || error.code.includes('unavailable')) {
        return 'NETWORK_ERROR';
      }
      if (error.code.includes('permission') || error.code.includes('auth')) {
        return 'HEALTH_DATA_ERROR';
      }
    }

    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('connection')) {
        return 'NETWORK_ERROR';
      }
      if (message.includes('ai') || message.includes('openai') || message.includes('api')) {
        return 'AI_SERVICE_ERROR';
      }
      if (message.includes('health') || message.includes('firestore')) {
        return 'HEALTH_DATA_ERROR';
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return 'VALIDATION_ERROR';
      }
      if (message.includes('emergency')) {
        return 'EMERGENCY_DETECTION_ERROR';
      }
      if (message.includes('safety') || message.includes('filter')) {
        return 'SAFETY_FILTER_ERROR';
      }
    }

    return 'NETWORK_ERROR'; // Default to network error for unknown issues
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (error.code) {
      return `System error: ${error.code}`;
    }
    return 'An unknown error occurred';
  }

  /**
   * Log error for debugging
   */
  private logError(error: ChatbotError, context: string): void {
    console.error(`[${context}] Chatbot Error:`, {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      details: error.details,
    });
  }

  // Fallback response generators

  private getNetworkErrorFallback(): string {
    return `🌐 **Connection Issue**\n\nPlease check your internet connection and try again.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  private getAIServiceErrorFallback(): string {
    return `🤖 **Assistant Temporarily Unavailable**\n\nPlease try again in a few minutes. Call 911 in case of emergency.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  private getHealthDataErrorFallback(): string {
    return `📊 **Health Data Issue**\n\nYour health data is inaccessible. I can provide general recommendations.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  private getEmergencyDetectionErrorFallback(): string {
    return this.createEmergencyFallback();
  }

  private getSafetyFilterErrorFallback(): string {
    return `⚠️ **Safety Check**\n\nThis response was filtered for your safety. Consult your doctor.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  private getValidationErrorFallback(context?: string): string {
    return `❌ **Invalid Input**\n\nPlease check your message and try again.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }

  private getGenericErrorFallback(): string {
    return `⚠️ **System Error**\n\nAn issue occurred. Please try again or call 911 in case of emergency.\n\n${MEDICAL_DISCLAIMERS.GENERAL}`;
  }
}

// Export singleton instance
export const errorHandlerService = new ErrorHandlerService();