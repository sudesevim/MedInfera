// Environment Configuration for Medical Chatbot
// This file manages environment variables and API configurations

export interface EnvironmentConfig {
  AI_SERVICE_PROVIDER: 'python-backend' | 'ollama' | 'mock';
  PYTHON_BACKEND_URL?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  EMERGENCY_PHONE_NUMBER: string;
  POISON_CONTROL_NUMBER: string;
  ENABLE_EMERGENCY_DETECTION: boolean;
  ENABLE_MEDICATION_INTERACTIONS: boolean;
  MAX_CONVERSATION_HISTORY: number;
  AI_RESPONSE_TIMEOUT_MS: number;
  ENABLE_OFFLINE_MODE: boolean;
}

// Default configuration - can be overridden by environment variables
const defaultConfig: EnvironmentConfig = {
  AI_SERVICE_PROVIDER: 'python-backend', // Use Python backend as default
  EMERGENCY_PHONE_NUMBER: '112', // European emergency number
  POISON_CONTROL_NUMBER: '114', // Turkey poison control
  ENABLE_EMERGENCY_DETECTION: true,
  ENABLE_MEDICATION_INTERACTIONS: true,
  MAX_CONVERSATION_HISTORY: 100,
  AI_RESPONSE_TIMEOUT_MS: 30000, // 30 seconds for AI responses (Ollama can be slow)
  ENABLE_OFFLINE_MODE: true,
};

// Environment configuration with fallbacks
export const environmentConfig: EnvironmentConfig = {
  AI_SERVICE_PROVIDER: defaultConfig.AI_SERVICE_PROVIDER,
  PYTHON_BACKEND_URL: 'http://localhost:8000', // Python backend URL
  OLLAMA_BASE_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'llama2',
  EMERGENCY_PHONE_NUMBER: defaultConfig.EMERGENCY_PHONE_NUMBER,
  POISON_CONTROL_NUMBER: defaultConfig.POISON_CONTROL_NUMBER,
  ENABLE_EMERGENCY_DETECTION: defaultConfig.ENABLE_EMERGENCY_DETECTION,
  ENABLE_MEDICATION_INTERACTIONS: defaultConfig.ENABLE_MEDICATION_INTERACTIONS,
  MAX_CONVERSATION_HISTORY: defaultConfig.MAX_CONVERSATION_HISTORY,
  AI_RESPONSE_TIMEOUT_MS: defaultConfig.AI_RESPONSE_TIMEOUT_MS,
  ENABLE_OFFLINE_MODE: defaultConfig.ENABLE_OFFLINE_MODE,
};

// Validation function to ensure required config is present
export const validateEnvironmentConfig = (): boolean => {
  if (environmentConfig.AI_SERVICE_PROVIDER === 'ollama' && !environmentConfig.OLLAMA_BASE_URL) {
    console.warn('OLLAMA_BASE_URL is required when using ollama provider');
    return false;
  }
  
  return true;
};

// Medical disclaimer templates
export const MEDICAL_DISCLAIMERS = {
  GENERAL: "⚠️ This information is for general purposes only. Always consult a healthcare professional for medical diagnosis and treatment.",
  EMERGENCY: "🚨 EMERGENCY: These may be serious symptoms. Call 911 immediately or go to the nearest emergency room.",
  MEDICATION: "💊 Medication information is for informational purposes only. Always consult your doctor regarding medication use.",
  DIAGNOSIS: "🩺 I cannot provide medical diagnosis. Always consult a doctor for your symptoms.",
  INTERACTION: "⚠️ Medication interaction detected. Always consult your doctor or pharmacist about this.",
};

// Emergency contact templates
export const EMERGENCY_CONTACTS = {
  GENERAL_EMERGENCY: {
    name: "Emergency Services",
    phone: environmentConfig.EMERGENCY_PHONE_NUMBER,
    description: "For general emergencies"
  },
  POISON_CONTROL: {
    name: "Poison Control",
    phone: environmentConfig.POISON_CONTROL_NUMBER,
    description: "For poisoning situations"
  },
};

// AI Service Configuration
export const AI_SERVICE_CONFIG = {
  OLLAMA: {
    baseUrl: environmentConfig.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: environmentConfig.OLLAMA_MODEL || 'llama2',
    maxTokens: 500,
    temperature: 0.7,
  },
  MOCK: {
    // Mock service for development/testing
    responseDelay: 1000, // 1 second delay to simulate real API
  },
};