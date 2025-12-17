// Medical Chatbot Data Models
// These interfaces define the core data structures for the chatbot feature

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  messageType: 'text' | 'emergency' | 'medication_reminder' | 'health_insight';
  metadata?: {
    healthDataReferenced?: string[];
    emergencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    disclaimerShown?: boolean;
  };
}

export interface HealthContext {
  userId: string;
  currentMedications: Medication[];
  recentVitals: VitalSigns[];
  chronicConditions: string[];
  allergies: string[];
  recentSymptoms: Symptom[];
  lastUpdated: Date;
}

export interface Medication {
  id?: string;
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VitalSigns {
  id?: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar';
  value: string;
  unit: string;
  date: string;
  notes?: string;
}

export interface Symptom {
  id?: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
  date: string;
  bodyPart?: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  requiresDisclaimer: boolean;
  emergencyDetected: boolean;
  healthDataUsed: string[];
  suggestedActions?: string[];
  followUpQuestions?: string[];
}

export interface EmergencyAssessment {
  isEmergency: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  recommendedActions: string[];
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

export interface InteractionWarning {
  medicationA: string;
  medicationB: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export interface ConversationThread {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  isArchived: boolean;
  messageCount: number;
}

// Service Interface Types
export interface IChatService {
  sendMessage(message: string, userId: string): Promise<ChatMessage>;
  getConversationHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  subscribeToMessages(userId: string, callback: (messages: ChatMessage[]) => void): () => void;
  markMessageAsRead(messageId: string): Promise<void>;
}

export interface IAIService {
  generateResponse(message: string, context: HealthContext): Promise<AIResponse>;
  detectEmergency(message: string): Promise<EmergencyAssessment>;
  checkMedicationInteractions(medications: string[]): Promise<InteractionWarning[]>;
}

export interface IHealthDataService {
  getUserHealthContext(userId: string): Promise<HealthContext>;
  getMedications(userId: string): Promise<Medication[]>;
  getRecentVitals(userId: string, days: number): Promise<VitalSigns[]>;
  getSymptomHistory(userId: string, days: number): Promise<Symptom[]>;
}

export interface ISafetyFilter {
  filterResponse(response: AIResponse, messageType: string): AIResponse;
  addMedicalDisclaimer(content: string): string;
  detectSafetyCriticalTopics(message: string): boolean;
}

export interface IEmergencyDetector {
  detectEmergencySymptoms(message: string): EmergencyAssessment;
  getEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
  logEmergencyInteraction(userId: string, assessment: EmergencyAssessment): Promise<void>;
}

// UI Component Props Types
export interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showTimestamp?: boolean;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export interface TypingIndicatorProps {
  visible: boolean;
  estimatedTime?: number;
}

export interface ConversationHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

// Error Types
export interface ChatbotError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type ChatbotErrorType = 
  | 'NETWORK_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'HEALTH_DATA_ERROR'
  | 'VALIDATION_ERROR'
  | 'EMERGENCY_DETECTION_ERROR'
  | 'SAFETY_FILTER_ERROR';