// Input Validation Utilities for Medical Chatbot
// Handles message validation and sanitization

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export class MessageValidator {
  
  /**
   * Validate chat message input
   */
  static validateMessage(message: string, maxLength: number = 1000): ValidationResult {
    // Check if message is empty or only whitespace
    if (!message || !message.trim()) {
      return {
        isValid: false,
        error: 'Message cannot be empty',
      };
    }

    const trimmedMessage = message.trim();

    // Check length
    if (trimmedMessage.length > maxLength) {
      return {
        isValid: false,
        error: `Message cannot be longer than ${maxLength} characters`,
      };
    }

    // Check for minimum length
    if (trimmedMessage.length < 2) {
      return {
        isValid: false,
        error: 'Message must be at least 2 characters',
      };
    }

    // Sanitize message
    const sanitizedMessage = this.sanitizeMessage(trimmedMessage);

    return {
      isValid: true,
      sanitizedValue: sanitizedMessage,
    };
  }

  /**
   * Sanitize message content
   */
  static sanitizeMessage(message: string): string {
    let sanitized = message.trim();

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Remove potentially harmful characters (basic sanitization)
    sanitized = sanitized.replace(/[<>]/g, '');

    // Limit consecutive punctuation
    sanitized = sanitized.replace(/[!]{3,}/g, '!!!');
    sanitized = sanitized.replace(/[?]{3,}/g, '???');
    sanitized = sanitized.replace(/[.]{4,}/g, '...');

    return sanitized;
  }

  /**
   * Check if message contains only whitespace characters
   */
  static isWhitespaceOnly(message: string): boolean {
    return /^\s*$/.test(message);
  }

  /**
   * Check if message contains potentially sensitive information
   */
  static containsSensitiveInfo(message: string): boolean {
    const sensitivePatterns = [
      // Personal identification
      /\b\d{11}\b/, // TC kimlik no
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
      
      // Medical record numbers
      /patient\s*no[:\s]*\d+/i,
      /file\s*no[:\s]*\d+/i,
      
      // Phone numbers (basic pattern)
      /\b\d{3}\s?\d{3}\s?\d{4}\b/,
    ];

    return sensitivePatterns.some(pattern => pattern.test(message));
  }

  /**
   * Validate and format emergency message
   */
  static validateEmergencyMessage(message: string): ValidationResult {
    const baseValidation = this.validateMessage(message);
    
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    // For emergency messages, ensure they're clear and actionable
    const sanitized = baseValidation.sanitizedValue!;
    
    // Add emergency context if missing
    let formattedMessage = sanitized;
    if (!sanitized.toLowerCase().includes('emergency')) {
      formattedMessage = `EMERGENCY: ${sanitized}`;
    }

    return {
      isValid: true,
      sanitizedValue: formattedMessage,
    };
  }

  /**
   * Extract and validate medication names from message
   */
  static extractMedicationNames(message: string): string[] {
    const medications: string[] = [];
    
    // Common medication patterns
    const medicationPatterns = [
      /(\w+)\s*(mg|gr|ml|tablet|capsule)/gi,
      /medication\s*:?\s*([a-zA-Z\s]+)/gi,
      /(aspirin|paracetamol|ibuprofen|diclofenac|metformin|insulin)/gi,
    ];

    medicationPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/\b(mg|gr|ml|tablet|capsule|medication)\b/gi, '').trim();
          if (cleaned.length > 2) {
            medications.push(cleaned);
          }
        });
      }
    });

    // Remove duplicates and return
    return [...new Set(medications)];
  }

  /**
   * Check message urgency level
   */
  static assessMessageUrgency(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    // Critical urgency keywords
    const criticalKeywords = [
      'heart attack', 'can\'t breathe', 'unconscious', 'vomiting blood',
      'severe pain', 'stroke', 'paralysis'
    ];
    
    // High urgency keywords
    const highKeywords = [
      'emergency', 'severe', 'unbearable', 'high fever',
      'shortness of breath', 'chest pain'
    ];
    
    // Medium urgency keywords
    const mediumKeywords = [
      'pain', 'fever', 'nausea', 'headache', 'abdominal pain'
    ];

    if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'critical';
    }
    
    if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Format message for display
   */
  static formatMessageForDisplay(message: string, maxDisplayLength: number = 100): string {
    if (message.length <= maxDisplayLength) {
      return message;
    }
    
    return message.substring(0, maxDisplayLength - 3) + '...';
  }

  /**
   * Check if message requires medical disclaimer
   */
  static requiresMedicalDisclaimer(message: string): boolean {
    const medicalKeywords = [
      'diagnosis', 'treatment', 'medication',
      'disease', 'symptom', 'pain'
    ];
    
    const lowerMessage = message.toLowerCase();
    return medicalKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

/**
 * Input sanitization for different contexts
 */
export class InputSanitizer {
  
  /**
   * Sanitize user input for database storage
   */
  static sanitizeForStorage(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[<>]/g, '') // Remove potential HTML
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitize input for AI processing
   */
  static sanitizeForAI(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:()\-ğüşıöçĞÜŞİÖÇ]/g, '') // Keep only safe characters
      .substring(0, 500); // Limit for AI processing
  }

  /**
   * Sanitize input for display
   */
  static sanitizeForDisplay(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[<>&"']/g, ''); // Remove HTML-sensitive characters
  }
}

/**
 * Message formatting utilities
 */
export class MessageFormatter {
  
  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return timestamp.toLocaleDateString('en-US');
    }
  }

  /**
   * Format message content with line breaks
   */
  static formatMessageContent(content: string): string {
    return content
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
      .replace(/(.{80})/g, '$1\n') // Add line breaks for long lines
      .trim();
  }

  /**
   * Truncate message for preview
   */
  static truncateForPreview(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) {
      return message;
    }
    
    const truncated = message.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }
}