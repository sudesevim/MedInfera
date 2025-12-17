// Python Backend Service for Medical Chatbot
// Handles communication with the Python FastAPI backend

import { 
  AIResponse, 
  HealthContext, 
  EmergencyAssessment, 
  InteractionWarning, 
  IAIService 
} from '../types/chatbot.types';
import { environmentConfig } from '../config/environment';
import auth from '@react-native-firebase/auth';

// Python backend format (snake_case)
interface PythonHealthContext {
  user_id: string;
  current_medications: Array<{
    id?: string;
    name: string;
    type: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    instructions?: string;
    side_effects?: string[];
    created_at?: string;
    updated_at?: string;
  }>;
  recent_vitals: Array<{
    id?: string;
    type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar';
    value: string;
    unit: string;
    date: string;
    notes?: string;
  }>;
  chronic_conditions: string[];
  allergies: string[];
  recent_symptoms: Array<{
    id?: string;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
    description?: string;
    date: string;
    body_part?: string;
  }>;
  last_updated: string; // ISO string
}

interface ChatRequest {
  message: string;
  user_id: string;
  health_context?: PythonHealthContext;
}

interface ChatResponse {
  response: AIResponse;
  emergency_assessment?: EmergencyAssessment;
  processing_time_ms: number;
}

interface BackendStatus {
  status: string;
  available: boolean;
  model?: string;
  message?: string;
}

export class PythonBackendService implements IAIService {
  private baseUrl: string;
  private timeout: number;
  private emergencyTimeout: number;

  constructor() {
    this.baseUrl = environmentConfig.PYTHON_BACKEND_URL || 'http://localhost:8000';
    this.timeout = environmentConfig.AI_RESPONSE_TIMEOUT_MS || 30000; // 30 seconds for normal AI responses
    this.emergencyTimeout = 60000; // 60 seconds for emergency messages (more complex analysis)
  }

  /**
   * Check if message might be an emergency (simple keyword check)
   */
  private mightBeEmergency(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const emergencyKeywords = [
      'heart', 'chest', 'pain', 'hurts',
      'breathing', 'can\'t breathe',
      'emergency', 'urgent', 'critical'
    ];
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Create AbortController with timeout for React Native compatibility
   */
  private createAbortController(timeoutMs: number): { controller: AbortController; cleanup: () => void } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Request timeout, aborting...');
      controller.abort();
    }, timeoutMs);
    
    const cleanup = () => {
      clearTimeout(timeoutId);
    };
    
    return { controller, cleanup };
  }

  /**
   * Generate AI response using Python backend
   */
  async generateResponse(message: string, context: HealthContext): Promise<AIResponse> {
    try {
      console.log('PythonBackendService: Starting generateResponse for message:', message.substring(0, 50) + '...');
      
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get auth token
      console.log('PythonBackendService: Getting auth token...');
      const token = await user.getIdToken();
      console.log('PythonBackendService: Got token, length:', token.length);

      // Convert HealthContext from camelCase to snake_case for Python backend
      console.log('PythonBackendService: Converting health context...');
      const healthContextForBackend: PythonHealthContext | undefined = context ? this.convertHealthContext(context) : undefined;

      const requestBody: ChatRequest = {
        message: message.trim(),
        user_id: user.uid,
        health_context: healthContextForBackend,
      };
      
      console.log('PythonBackendService: Request body prepared, user_id:', user.uid);

      console.log('PythonBackendService: Making request to:', `${this.baseUrl}/api/chat`);
      console.log('PythonBackendService: Request body size:', JSON.stringify(requestBody).length);
      
      // Use longer timeout for potential emergency messages
      const isPotentialEmergency = this.mightBeEmergency(message);
      const requestTimeout = isPotentialEmergency ? this.emergencyTimeout : this.timeout;
      console.log(`PythonBackendService: Using timeout: ${requestTimeout}ms (${isPotentialEmergency ? 'emergency' : 'normal'})`);
      
      // Use a simpler fetch without AbortController for now to debug
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), requestTimeout);
      });
      
      const fetchPromise = fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('PythonBackendService: Got response with status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        if (response.status === 400 || response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || errorData.message || 'Invalid request';
          console.error('Backend validation error:', errorData);
          throw new Error(`Backend validation error: ${errorMessage}`);
        }
        const errorText = await response.text().catch(() => '');
        console.error(`Backend service error ${response.status}:`, errorText);
        throw new Error(`Backend service error: ${response.status}`);
      }

      console.log('PythonBackendService: Parsing response...');
      const data: ChatResponse = await response.json();
      console.log('PythonBackendService: Successfully got AI response');
      console.log('PythonBackendService: Response content length:', data.response?.content?.length || 0);
      console.log('PythonBackendService: Response content preview:', data.response?.content?.substring(0, 100) || 'NO CONTENT');
      console.log('PythonBackendService: Full response structure:', JSON.stringify({
        hasResponse: !!data.response,
        hasContent: !!data.response?.content,
        contentLength: data.response?.content?.length || 0,
        confidence: data.response?.confidence,
        emergencyDetected: data.response?.emergencyDetected,
        processingTime: data.processing_time_ms
      }));
      return data.response;

    } catch (error: any) {
      console.error('PythonBackendService generateResponse error:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        console.warn('Request was aborted (likely timeout)');
        return this.getFallbackResponse('Response timeout. Please try again.');
      }
      
      if (error.message === 'Request timeout') {
        console.warn('Request timed out');
        return this.getFallbackResponse('Response timeout. Please try again.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        // Network error - backend might be down
        console.warn('Python backend unavailable, using fallback response');
        return this.getFallbackResponse('Service is currently unavailable. Please try again later.');
      }
      
      if (error.message.includes('Authentication failed')) {
        // Re-throw authentication errors so they can be handled by the UI
        throw error;
      }
      
      // For other errors, use fallback response instead of throwing
      console.warn('Unknown error, using fallback response. Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
      return this.getFallbackResponse('An error occurred. Please try again.');
    }
  }

  /**
   * Detect emergency situations using Python backend
   */
  async detectEmergency(message: string): Promise<EmergencyAssessment> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      const { controller, cleanup } = this.createAbortController(this.timeout);
      
      try {
        const response = await fetch(`${this.baseUrl}/api/emergency/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });

        cleanup();

        if (!response.ok) {
          throw new Error(`Emergency detection failed: ${response.status}`);
        }

        return await response.json();
        
      } catch (fetchError: any) {
        cleanup();
        throw fetchError;
      }

    } catch (error: any) {
      console.error('PythonBackendService detectEmergency error:', error);
      
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
   * Check medication interactions using Python backend
   */
  async checkMedicationInteractions(medications: string[]): Promise<InteractionWarning[]> {
    try {
      if (medications.length < 2) {
        return [];
      }

      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      const { controller, cleanup } = this.createAbortController(this.timeout);
      
      try {
        const response = await fetch(`${this.baseUrl}/api/medications/interactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ medications }),
          signal: controller.signal,
        });

        cleanup();

        if (!response.ok) {
          throw new Error(`Medication interaction check failed: ${response.status}`);
        }

        return await response.json();
        
      } catch (fetchError: any) {
        cleanup();
        throw fetchError;
      }

    } catch (error: any) {
      console.error('PythonBackendService checkMedicationInteractions error:', error);
      return [];
    }
  }

  /**
   * Check Python backend and Ollama status
   */
  async checkBackendStatus(): Promise<BackendStatus> {
    try {
      const { controller, cleanup } = this.createAbortController(5000);
      
      try {
        const response = await fetch(`${this.baseUrl}/api/ollama/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        cleanup();

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        return await response.json();
        
      } catch (fetchError: any) {
        cleanup();
        throw fetchError;
      }

    } catch (error: any) {
      console.error('PythonBackendService checkBackendStatus error:', error);
      return {
        status: 'error',
        available: false,
        message: `Cannot connect to backend: ${error.message}`
      };
    }
  }

  /**
   * Check if backend is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const { controller, cleanup } = this.createAbortController(5000);
      
      try {
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        cleanup();

        return response.ok;
        
      } catch (fetchError: any) {
        cleanup();
        throw fetchError;
      }

    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Safely convert HealthContext from camelCase to snake_case for Python backend
   */
  private convertHealthContext(context: HealthContext): PythonHealthContext {
    try {
      return {
        user_id: context.userId || '',
        current_medications: (context.currentMedications || []).map(med => {
          try {
            return {
              id: med.id,
              name: med.name || '',
              type: med.type || '',
              dosage: med.dosage || '',
              frequency: med.frequency || '',
              start_date: med.startDate || '',
              end_date: med.endDate,
              instructions: med.instructions,
              side_effects: med.sideEffects,
              created_at: this.safeToISOString(med.createdAt),
              updated_at: this.safeToISOString(med.updatedAt),
            };
          } catch (error) {
            console.error('Error converting medication:', med, error);
            return {
              id: med.id,
              name: med.name || 'Unknown',
              type: med.type || 'Unknown',
              dosage: med.dosage || 'Unknown',
              frequency: med.frequency || 'Unknown',
              start_date: med.startDate || new Date().toISOString().split('T')[0],
            };
          }
        }),
        recent_vitals: (context.recentVitals || []).map(vital => ({
          id: vital.id,
          type: vital.type,
          value: vital.value || '',
          unit: vital.unit || '',
          date: vital.date || new Date().toISOString().split('T')[0],
          notes: vital.notes,
        })),
        chronic_conditions: context.chronicConditions || [],
        allergies: context.allergies || [],
        recent_symptoms: (context.recentSymptoms || []).map(symptom => ({
          id: symptom.id,
          name: symptom.name || '',
          severity: symptom.severity || 'mild',
          duration: symptom.duration || '',
          description: symptom.description,
          date: symptom.date || new Date().toISOString().split('T')[0],
          body_part: symptom.bodyPart,
        })),
        last_updated: this.safeToISOString(context.lastUpdated) || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error converting health context:', error);
      // Return minimal valid context
      return {
        user_id: context.userId || '',
        current_medications: [],
        recent_vitals: [],
        chronic_conditions: [],
        allergies: [],
        recent_symptoms: [],
        last_updated: new Date().toISOString(),
      };
    }
  }

  /**
   * Safely convert Date to ISO string
   */
  private safeToISOString(date: any): string | undefined {
    try {
      if (!date) return undefined;
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') return new Date(date).toISOString();
      return undefined;
    } catch (error) {
      console.error('Error converting date to ISO string:', date, error);
      return undefined;
    }
  }

  /**
   * Get fallback response when backend is unavailable
   */
  private getFallbackResponse(message: string): AIResponse {
    return {
      content: message,
      confidence: 0.0,
      requiresDisclaimer: false, // Don't add disclaimer to fallback messages
      emergencyDetected: false,
      healthDataUsed: [],
      suggestedActions: [
        'Try again later',
        'Call 911 in case of emergency',
        'Consult your doctor'
      ],
    };
  }
}

// Export singleton instance
export const pythonBackendService = new PythonBackendService();