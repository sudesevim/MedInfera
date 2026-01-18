// Chat State Management Hook
// Manages chat state, message handling, and UI interactions

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { ChatMessage, HealthContext } from '../types/chatbot.types';
import { 
  chatService, 
  aiService, 
  healthDataService, 
  emergencyDetectorService,
  safetyFilterService,
  conversationManagerService,
  healthInterpreterService,
  errorHandlerService
} from '../services';
import { MessageValidator } from '../utils/validation';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  healthContext: HealthContext | null;
}

interface UseChatStateReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
  clearConversation: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  
  // Input state
  inputText: string;
  setInputText: (text: string) => void;
  isInputValid: boolean;
  inputError: string | null;
}

export const useChatState = (userId: string): UseChatStateReturn => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    isTyping: false,
    error: null,
    healthContext: null,
  });

  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Validate input text
  const isInputValid = useCallback(() => {
    if (!inputText.trim()) return false;
    
    const validation = MessageValidator.validateMessage(inputText);
    if (!validation.isValid) {
      setInputError(validation.error || null);
      return false;
    }
    
    setInputError(null);
    return true;
  }, [inputText]);

  // Initialize chat state
  useEffect(() => {
    if (!userId || isInitializedRef.current) return;
    
    initializeChat();
    isInitializedRef.current = true;
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  const initializeChat = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load health context
      const healthContext = await healthDataService.getUserHealthContext(userId);
      
      // Load conversation history
      let messages = await chatService.getConversationHistory(userId);
      
      // Ensure messages are sorted by timestamp (oldest first)
      messages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Subscribe to real-time updates
      const unsubscribe = chatService.subscribeToMessages(userId, (newMessages) => {
        console.log('📨 useChatState: Received messages from subscription:', newMessages.length);
        console.log('📨 useChatState: Message contents:', newMessages.map(m => ({
          id: m.id,
          sender: m.sender,
          content: m.content?.substring(0, 50) || 'NO CONTENT',
          timestamp: m.timestamp
        })));
        // Ensure messages are sorted by timestamp (oldest first)
        const sortedMessages = [...newMessages].sort((a, b) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );
        console.log('📨 useChatState: Setting messages in state, count:', sortedMessages.length);
        setState(prev => ({
          ...prev,
          messages: sortedMessages,
          isLoading: false,
        }));
      });
      
      unsubscribeRef.current = unsubscribe;
      
      setState(prev => ({
        ...prev,
        messages,
        healthContext,
        isLoading: false,
      }));

      // Send welcome message if no conversation history
      if (messages.length === 0) {
        await sendWelcomeMessage();
      }

    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Sohbet başlatılamadı. Lütfen tekrar deneyin.',
      }));
    }
  };

  const sendWelcomeMessage = async () => {
    try {
      const welcomeMessage = `Hello! I'm your MedInfera health assistant. 🏥

I can help you with:
• Health questions and symptom assessment
• Emergency guidance
• Health data analysis

⚠️ **Important:** I cannot provide medical diagnosis or prescribe medications. Always consult a healthcare professional for medical advice.

How can I help you today?`;

      await chatService.addBotMessage(welcomeMessage, userId, 'text', {
        disclaimerShown: true,
      });

    } catch (error: any) {
      console.error('Failed to send welcome message:', error);
      // Send simple fallback welcome
      const fallbackWelcome = `Hello! I'm your health assistant. How can I help you?\n\n⚠️ This information is for general purposes only.`;
      await chatService.addBotMessage(fallbackWelcome, userId, 'text', {
        disclaimerShown: true,
      });
    }
  };

  const sendMessage = async (message: string) => {
    const operationId = `send_message_${Date.now()}`;
    
    try {
      // Validate message
      const validation = MessageValidator.validateMessage(message);
      if (!validation.isValid) {
        const error = errorHandlerService.handleError(
          new Error(validation.error), 
          'message_validation'
        );
        const fallback = errorHandlerService.getFallbackResponse('VALIDATION_ERROR', validation.error);
        Alert.alert('Geçersiz Mesaj', fallback.content);
        return;
      }

      const sanitizedMessage = validation.sanitizedValue!;
      
      setState(prev => ({ ...prev, isTyping: true, error: null }));

      // Send user message with retry logic
      let userMessage;
      try {
        console.log('👤 useChatState: Sending user message to Firestore:', sanitizedMessage.substring(0, 50));
        userMessage = await chatService.sendMessage(sanitizedMessage, userId);
        console.log('👤 useChatState: User message saved with ID:', userMessage.id);
        errorHandlerService.clearRetryAttempts(operationId);
      } catch (sendError: any) {
        const chatbotError = errorHandlerService.handleError(sendError, 'send_message');
        
        if (errorHandlerService.shouldRetry(operationId, chatbotError.code as any)) {
          errorHandlerService.recordRetryAttempt(operationId);
          const delay = errorHandlerService.getRetryDelay(operationId);
          
          setTimeout(async () => {
            try {
              userMessage = await chatService.sendMessage(sanitizedMessage, userId);
              errorHandlerService.clearRetryAttempts(operationId);
            } catch (retryError: any) {
              await handleSendMessageError(retryError, sanitizedMessage);
              return;
            }
          }, delay);
          return;
        } else {
          await handleSendMessageError(sendError, sanitizedMessage);
          return;
        }
      }

      // Check for emergency with error handling
      try {
        const emergencyAssessment = await emergencyDetectorService.detectEmergencySymptoms(sanitizedMessage);
        
        if (emergencyAssessment.isEmergency) {
          await handleEmergencyResponse(emergencyAssessment);
        } else {
          await generateAIResponse(sanitizedMessage);
        }
      } catch (emergencyError: any) {
        const chatbotError = errorHandlerService.handleError(emergencyError, 'emergency_detection');
        const fallbackContent = errorHandlerService.createEmergencyFallback();
        
        await chatService.addBotMessage(fallbackContent, userId, 'emergency', {
          disclaimerShown: true,
        });
      }

      // Clear input
      setInputText('');
      setInputError(null);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      const chatbotError = errorHandlerService.handleError(error, 'send_message_general');
      const fallback = errorHandlerService.getFallbackResponse(chatbotError.code as any);
      
      setState(prev => ({
        ...prev,
        isTyping: false,
        error: fallback.content,
      }));
    }
  };

  const handleSendMessageError = async (error: any, originalMessage: string) => {
    const chatbotError = errorHandlerService.handleError(error, 'send_message');
    const fallback = errorHandlerService.getFallbackResponse(chatbotError.code as any);
    
    // Send fallback response as bot message
    try {
      await chatService.addBotMessage(fallback.content, userId, 'text', {
        disclaimerShown: true,
      });
    } catch (fallbackError: any) {
      // If even fallback fails, show error in UI
      setState(prev => ({
        ...prev,
        isTyping: false,
        error: 'Sistem hatası. Lütfen uygulamayı yeniden başlatın.',
      }));
    }
    
    setState(prev => ({ ...prev, isTyping: false }));
  };

  const handleEmergencyResponse = async (assessment: any) => {
    try {
      // Log emergency interaction
      await emergencyDetectorService.logEmergencyInteraction(userId, assessment);
      
      // Generate emergency response
      const emergencyResponse = emergencyDetectorService.generateEmergencyResponse(assessment);
      
      // Get emergency contacts
      const emergencyContacts = await emergencyDetectorService.getEmergencyContacts(userId);
      const contactsInfo = emergencyDetectorService.formatEmergencyContacts(emergencyContacts);
      
      const fullResponse = `${emergencyResponse}\n\n${contactsInfo}`;
      
      // Send emergency message
      await chatService.addBotMessage(fullResponse, userId, 'emergency', {
        emergencyLevel: assessment.severity,
        disclaimerShown: true,
      });

    } catch (error: any) {
      console.error('Failed to handle emergency response:', error);
      
      // Send fallback emergency message
      const fallbackMessage = `🚨 EMERGENCY DETECTED\n\nCall 911 immediately or go to the nearest emergency room.\n\n⚠️ This information is for general guidance only. Always consult a healthcare professional for diagnosis and treatment.`;
      
      await chatService.addBotMessage(fallbackMessage, userId, 'emergency', {
        emergencyLevel: 'high',
        disclaimerShown: true,
      });
    } finally {
      setState(prev => ({ ...prev, isTyping: false }));
    }
  };

  const generateAIResponse = async (message: string) => {
    try {
      // Get current health context
      const healthContext = state.healthContext || await healthDataService.getUserHealthContext(userId);
      
      // Check for missing health data and suggest gathering
      const missingDataPrompt = await conversationManagerService.detectMissingHealthData(userId, message);
      
      // Generate AI response
      const aiResponse = await aiService.generateResponse(message, healthContext);
      
      // Apply safety filter
      const filteredResponse = safetyFilterService.filterResponse(aiResponse, 'text');
      
      // Add missing health data prompt if needed
      if (missingDataPrompt) {
        filteredResponse.content += `\n\n${missingDataPrompt}`;
      }
      
      // Check for medication interactions if medications mentioned
      const medications = MessageValidator.extractMedicationNames(message);
      if (medications.length > 0 && healthContext.currentMedications.length > 0) {
        const allMedications = [
          ...medications,
          ...healthContext.currentMedications.map(med => med.name)
        ];
        
        const interactions = safetyFilterService.checkMedicationInteractions(allMedications);
        if (interactions.length > 0) {
          const interactionWarning = safetyFilterService.formatInteractionWarnings(interactions);
          filteredResponse.content += interactionWarning;
        }
      }
      
      // Generate medication schedule if requested
      if (message.toLowerCase().includes('ilaç program') || 
          message.toLowerCase().includes('medication schedule')) {
        const medicationSchedule = await conversationManagerService.generateMedicationSchedule(
          userId, 
          healthContext.currentMedications
        );
        filteredResponse.content += `\n\n${medicationSchedule}`;
      }
      
      // Generate health data interpretation if requested
      if (message.toLowerCase().includes('sağlık analiz') || 
          message.toLowerCase().includes('verilerimi analiz') ||
          message.toLowerCase().includes('health analysis')) {
        const healthInsights = await healthInterpreterService.analyzeHealthMetrics(userId, 30);
        const interpretationText = healthInterpreterService.formatHealthInterpretation(healthInsights);
        filteredResponse.content += `\n\n${interpretationText}`;
      }
      
      // Provide vital signs interpretation if mentioned
      if (message.toLowerCase().includes('tansiyon') || 
          message.toLowerCase().includes('nabız') ||
          message.toLowerCase().includes('ateş') ||
          message.toLowerCase().includes('vital')) {
        const vitalInterpretation = healthInterpreterService.interpretVitalSigns(healthContext.recentVitals);
        if (vitalInterpretation && !vitalInterpretation.includes('bulunmuyor')) {
          filteredResponse.content += `\n\n${vitalInterpretation}`;
        }
      }
      
      // Send bot response
      console.log('🤖 useChatState: Adding bot message to Firestore');
      console.log('🤖 useChatState: Bot message content:', filteredResponse.content?.substring(0, 100));
      const botMessage = await chatService.addBotMessage(
        filteredResponse.content,
        userId,
        filteredResponse.emergencyDetected ? 'emergency' : 'text',
        {
          healthDataReferenced: filteredResponse.healthDataUsed,
          disclaimerShown: filteredResponse.requiresDisclaimer,
        }
      );
      console.log('🤖 useChatState: Bot message saved with ID:', botMessage.id);

    } catch (error: any) {
      console.error('Failed to generate AI response:', error);
      
      // Handle AI service error with appropriate fallback
      const chatbotError = errorHandlerService.handleError(error, 'ai_response_generation');
      const fallback = errorHandlerService.handleAIServiceFailure(message);
      
      try {
        await chatService.addBotMessage(fallback.content, userId, 'text', {
          disclaimerShown: true,
        });
      } catch (fallbackError: any) {
        // If fallback also fails, show generic error
        const genericFallback = errorHandlerService.getFallbackResponse('AI_SERVICE_ERROR');
        setState(prev => ({
          ...prev,
          error: genericFallback.content,
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isTyping: false }));
    }
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearConversation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await chatService.clearConversationHistory(userId);
      setState(prev => ({ ...prev, messages: [], isLoading: false }));
      
      // Send new welcome message
      await sendWelcomeMessage();
    } catch (error: any) {
      console.error('Failed to clear conversation:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Konuşma geçmişi temizlenemedi.',
      }));
    }
  }, [userId]);

  const refreshMessages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const messages = await chatService.getConversationHistory(userId);
      setState(prev => ({ ...prev, messages, isLoading: false }));
    } catch (error: any) {
      console.error('Failed to refresh messages:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Mesajlar yenilenemedi.',
      }));
    }
  }, [userId]);

  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    
    // Actions
    sendMessage,
    clearError,
    clearConversation,
    refreshMessages,
    
    // Input state
    inputText,
    setInputText,
    isInputValid: isInputValid(),
    inputError,
  };
};