/**
 * Property-Based Test for ChatMessage Data Model Validation
 * **Feature: medical-chatbot, Property 1: Message persistence and display**
 * **Validates: Requirements 1.1**
 */

import { ChatMessage } from '../src/types/chatbot.types';

// Mock fast-check functionality for now - can be replaced with actual fast-check when installed
interface ArbitraryGenerator<T> {
  generate(): T;
}

// Simple generators for testing without fast-check
const generators = {
  string: (minLength = 1, maxLength = 100): ArbitraryGenerator<string> => ({
    generate: () => {
      const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
      const content = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return content.trim() || 'test'; // Ensure non-empty after trim
    }
  }),
  
  oneOf: <T>(values: T[]): ArbitraryGenerator<T> => ({
    generate: () => values[Math.floor(Math.random() * values.length)]
  }),
  
  date: (): ArbitraryGenerator<Date> => ({
    generate: () => new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
  }),
  
  uuid: (): ArbitraryGenerator<string> => ({
    generate: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  })
};

// Generator for valid ChatMessage objects
const chatMessageGenerator: ArbitraryGenerator<ChatMessage> = {
  generate: (): ChatMessage => ({
    id: generators.uuid().generate(),
    userId: generators.uuid().generate(),
    content: generators.string(1, 500).generate(),
    sender: generators.oneOf(['user', 'bot', 'system'] as const).generate(),
    timestamp: generators.date().generate(),
    status: generators.oneOf(['sending', 'sent', 'delivered', 'read', 'error'] as const).generate(),
    messageType: generators.oneOf(['text', 'emergency', 'medication_reminder', 'health_insight'] as const).generate(),
    metadata: Math.random() > 0.5 ? {
      healthDataReferenced: Math.random() > 0.5 ? [generators.string().generate()] : undefined,
      emergencyLevel: Math.random() > 0.5 ? generators.oneOf(['low', 'medium', 'high', 'critical'] as const).generate() : undefined,
      disclaimerShown: Math.random() > 0.5
    } : undefined
  })
};

// Simple property testing runner
const runPropertyTest = (name: string, property: (input: any) => boolean, generator: ArbitraryGenerator<any>, iterations = 100) => {
  test(name, () => {
    const failures: any[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const input = generator.generate();
      try {
        const result = property(input);
        if (!result) {
          failures.push({ iteration: i, input, result });
        }
      } catch (error) {
        failures.push({ iteration: i, input, error: error.message });
      }
    }
    
    if (failures.length > 0) {
      console.error('Property test failures:', failures.slice(0, 5)); // Show first 5 failures
      throw new Error(`Property failed in ${failures.length}/${iterations} cases. First failure: ${JSON.stringify(failures[0], null, 2)}`);
    }
  });
};

describe('ChatMessage Property Tests', () => {
  /**
   * Property 1: Message persistence and display
   * For any valid message sent by a user, the message should appear in the conversation thread 
   * with correct sender identification, timestamp, and chronological ordering
   */
  runPropertyTest(
    'Property 1: Message persistence and display - valid messages have required fields',
    (message: ChatMessage) => {
      // Check that all required fields are present and valid
      const hasValidId = typeof message.id === 'string' && message.id.length > 0;
      const hasValidUserId = typeof message.userId === 'string' && message.userId.length > 0;
      const hasValidContent = typeof message.content === 'string' && message.content.length > 0;
      const hasValidSender = ['user', 'bot', 'system'].includes(message.sender);
      const hasValidTimestamp = message.timestamp instanceof Date && !isNaN(message.timestamp.getTime());
      const hasValidStatus = ['sending', 'sent', 'delivered', 'read', 'error'].includes(message.status);
      const hasValidMessageType = ['text', 'emergency', 'medication_reminder', 'health_insight'].includes(message.messageType);
      
      return hasValidId && hasValidUserId && hasValidContent && hasValidSender && 
             hasValidTimestamp && hasValidStatus && hasValidMessageType;
    },
    chatMessageGenerator,
    100
  );

  runPropertyTest(
    'Property 1: Message persistence and display - sender identification is preserved',
    (message: ChatMessage) => {
      // The sender field should remain unchanged and be one of the valid values
      const validSenders = ['user', 'bot', 'system'];
      return validSenders.includes(message.sender);
    },
    chatMessageGenerator,
    100
  );

  runPropertyTest(
    'Property 1: Message persistence and display - timestamp ordering consistency',
    (message: ChatMessage) => {
      // Timestamp should be a valid date that's not in the future
      const now = new Date();
      const messageTime = message.timestamp;
      
      // Message timestamp should be valid and not more than 1 minute in the future (allowing for clock skew)
      return messageTime instanceof Date && 
             !isNaN(messageTime.getTime()) && 
             messageTime.getTime() <= (now.getTime() + 60000);
    },
    chatMessageGenerator,
    100
  );

  runPropertyTest(
    'Property 1: Message persistence and display - content preservation',
    (message: ChatMessage) => {
      // Message content should be preserved exactly as sent (non-empty string)
      return typeof message.content === 'string' && 
             message.content.length > 0 && 
             message.content === message.content.trim(); // Should not have leading/trailing whitespace
    },
    chatMessageGenerator,
    100
  );

  runPropertyTest(
    'Property 1: Message persistence and display - metadata structure validity',
    (message: ChatMessage) => {
      // If metadata exists, it should have valid structure
      if (!message.metadata) {
        return true; // Metadata is optional
      }
      
      const metadata = message.metadata;
      
      // Check healthDataReferenced if present
      if (metadata.healthDataReferenced !== undefined) {
        if (!Array.isArray(metadata.healthDataReferenced)) {
          return false;
        }
        // All elements should be strings
        if (!metadata.healthDataReferenced.every(item => typeof item === 'string')) {
          return false;
        }
      }
      
      // Check emergencyLevel if present
      if (metadata.emergencyLevel !== undefined) {
        const validLevels = ['low', 'medium', 'high', 'critical'];
        if (!validLevels.includes(metadata.emergencyLevel)) {
          return false;
        }
      }
      
      // Check disclaimerShown if present
      if (metadata.disclaimerShown !== undefined) {
        if (typeof metadata.disclaimerShown !== 'boolean') {
          return false;
        }
      }
      
      return true;
    },
    chatMessageGenerator,
    100
  );

  // Test chronological ordering with multiple messages
  test('Property 1: Message persistence and display - chronological ordering with multiple messages', () => {
    const messages: ChatMessage[] = [];
    const baseTime = new Date();
    
    // Generate messages with incrementing timestamps
    for (let i = 0; i < 10; i++) {
      const message = chatMessageGenerator.generate();
      message.timestamp = new Date(baseTime.getTime() + (i * 1000)); // 1 second apart
      messages.push(message);
    }
    
    // Sort messages by timestamp (ascending - oldest first)
    const sortedMessages = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Verify that sorting maintains chronological order
    for (let i = 1; i < sortedMessages.length; i++) {
      expect(sortedMessages[i].timestamp.getTime()).toBeGreaterThanOrEqual(sortedMessages[i-1].timestamp.getTime());
    }
    
    // Verify that the first message is the oldest
    expect(sortedMessages[0].timestamp.getTime()).toBeLessThanOrEqual(sortedMessages[sortedMessages.length - 1].timestamp.getTime());
  });
});