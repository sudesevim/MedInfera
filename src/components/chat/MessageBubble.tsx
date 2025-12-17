// Message Bubble Component for Medical Chatbot
// Displays individual messages with proper styling and metadata

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChatMessage } from '../../types/chatbot.types';
import { colors } from '../../theme';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showTimestamp?: boolean;
  onPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  message,
  isCurrentUser,
  showTimestamp = true,
  onPress,
}) => {
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show only time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // If this week, show day and time
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('tr-TR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageIcon = (): string => {
    switch (message.messageType) {
      case 'emergency':
        return '🚨';
      case 'medication_reminder':
        return '💊';
      case 'health_insight':
        return '📊';
      default:
        return '';
    }
  };

  const getStatusIcon = (): string => {
    if (!isCurrentUser) return '';
    
    switch (message.status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  const getBubbleStyle = () => {
    const baseStyle = [styles.bubble];
    
    if (isCurrentUser) {
      baseStyle.push(styles.userBubble);
    } else {
      baseStyle.push(styles.botBubble);
      
      // Special styling for different message types
      switch (message.messageType) {
        case 'emergency':
          baseStyle.push(styles.emergencyBubble);
          break;
        case 'medication_reminder':
          baseStyle.push(styles.medicationBubble);
          break;
        case 'health_insight':
          baseStyle.push(styles.healthInsightBubble);
          break;
      }
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.messageText];
    
    if (isCurrentUser) {
      baseStyle.push(styles.userText);
    } else {
      baseStyle.push(styles.botText);
    }
    
    return baseStyle;
  };

  const renderMessageContent = () => {
    const icon = getMessageIcon();
    const content = message.content;
    
    console.log('💬 MessageBubble: Rendering content:', {
      id: message.id,
      sender: message.sender,
      hasContent: !!content,
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 50) || 'NO CONTENT',
      messageType: message.messageType
    });
    
    // Format emergency messages
    if (message.messageType === 'emergency') {
      return (
        <View>
          <Text style={[getTextStyle(), styles.emergencyText]}>
            {icon} {content}
          </Text>
          {message.metadata?.emergencyLevel && (
            <Text style={styles.emergencyLevel}>
              Urgency: {message.metadata.emergencyLevel.toUpperCase()}
            </Text>
          )}
        </View>
      );
    }
    
    // Format medication reminders
    if (message.messageType === 'medication_reminder') {
      return (
        <Text style={[getTextStyle(), styles.medicationText]}>
          {icon} {content}
        </Text>
      );
    }
    
    // Format health insights
    if (message.messageType === 'health_insight') {
      return (
        <Text style={[getTextStyle(), styles.healthInsightText]}>
          {icon} {content}
        </Text>
      );
    }
    
    // Regular message
    return (
      <Text style={getTextStyle()}>
        {content}
      </Text>
    );
  };

  const renderHealthDataReferences = () => {
    if (!message.metadata?.healthDataReferenced || message.metadata.healthDataReferenced.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.healthDataContainer}>
        <Text style={styles.healthDataLabel}>
          📋 Health data used: {message.metadata.healthDataReferenced.join(', ')}
        </Text>
      </View>
    );
  };

  const renderDisclaimer = () => {
    // Don't show disclaimer for user messages
    if (isCurrentUser) {
      return null;
    }
    
    // Check if disclaimer is already in the message content (English or Turkish)
    const hasDisclaimerInContent = 
      message.content.includes('⚠️') || 
      message.content.includes('This information is for general') ||
      message.content.includes('healthcare professional') ||
      message.content.includes('Bu bilgiler sadece genel') ||
      message.content.includes('sağlık profesyoneli');
    
    // Only show separate disclaimer if:
    // 1. metadata says to show it AND
    // 2. disclaimer is NOT already in the content
    if (message.metadata?.disclaimerShown && !hasDisclaimerInContent) {
      return (
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This information is for general guidance only. Always consult a healthcare professional for diagnosis and treatment.
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentUser ? styles.userContainer : styles.botContainer,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={getBubbleStyle()}>
        {renderMessageContent()}
        {renderHealthDataReferences()}
        {renderDisclaimer()}
        
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {formatTimestamp(message.timestamp)}
            </Text>
            <Text style={styles.statusIcon}>
              {getStatusIcon()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.isCurrentUser === nextProps.isCurrentUser &&
    prevProps.showTimestamp === nextProps.showTimestamp
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderBottomLeftRadius: 4,
  },
  emergencyBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 2,
  },
  medicationBubble: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  healthInsightBubble: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: colors.text.primary,
  },
  emergencyText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  medicationText: {
    color: '#2e7d32',
  },
  healthInsightText: {
    color: '#1565c0',
  },
  emergencyLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  healthDataContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.primary[200],
  },
  healthDataLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  disclaimerContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffcc02',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#f57c00',
    fontStyle: 'italic',
  },
  timestampContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  statusIcon: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
});