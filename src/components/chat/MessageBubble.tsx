// Message Bubble Component for Medical Chatbot
// Displays individual messages with proper styling and metadata

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // If this week, show day and time
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMessageIconName = (): string | null => {
    switch (message.messageType) {
      case 'emergency':
        return 'alert-circle';
      case 'medication_reminder':
        return 'medical';
      case 'health_insight':
        return 'stats-chart';
      default:
        return null;
    }
  };

  const getStatusIconName = (): string | null => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case 'sending':
        return 'time-outline';
      case 'sent':
        return 'checkmark';
      case 'delivered':
        return 'checkmark-done';
      case 'read':
        return 'checkmark-done';
      case 'error':
        return 'close-circle';
      default:
        return null;
    }
  };

  const getBubbleStyle = () => {
    if (isCurrentUser) {
      return [styles.bubble, styles.userBubble];
    }
    
    // Bot messages with special types
    const botStyles = [styles.bubble, styles.botBubble];
    
    switch (message.messageType) {
      case 'emergency':
        return [...botStyles, styles.emergencyBubble];
      case 'medication_reminder':
        return [...botStyles, styles.medicationBubble];
      case 'health_insight':
        return [...botStyles, styles.healthInsightBubble];
      default:
        return botStyles;
    }
  };

  const getTextStyle = () => {
    if (isCurrentUser) {
      return [styles.messageText, styles.userText];
    }
    return [styles.messageText, styles.botText];
  };

  const renderMessageContent = () => {
    const iconName = getMessageIconName();
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
          <View style={styles.messageWithIcon}>
            {iconName && <Icon name={iconName} size={18} color="#d32f2f" style={styles.messageIcon} />}
            <Text style={[getTextStyle(), styles.emergencyText, styles.messageTextWithIcon]}>
              {content}
            </Text>
          </View>
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
        <View style={styles.messageWithIcon}>
          {iconName && <Icon name={iconName} size={18} color="#2e7d32" style={styles.messageIcon} />}
          <Text style={[getTextStyle(), styles.medicationText, styles.messageTextWithIcon]}>
            {content}
          </Text>
        </View>
      );
    }
    
    // Format health insights
    if (message.messageType === 'health_insight') {
      return (
        <View style={styles.messageWithIcon}>
          {iconName && <Icon name={iconName} size={18} color={colors.mint.dark} style={styles.messageIcon} />}
          <Text style={[getTextStyle(), styles.healthInsightText, styles.messageTextWithIcon]}>
            {content}
          </Text>
        </View>
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
        <View style={styles.messageWithIcon}>
          <Icon name="clipboard-outline" size={14} color={colors.text.secondary} style={styles.messageIcon} />
          <Text style={[styles.healthDataLabel, styles.messageTextWithIcon]}>
            Health data used: {message.metadata.healthDataReferenced.join(', ')}
          </Text>
        </View>
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
          <View style={styles.messageWithIcon}>
            <Icon name="warning-outline" size={14} color="#f57c00" style={styles.messageIcon} />
            <Text style={[styles.disclaimerText, styles.messageTextWithIcon]}>
              This information is for general guidance only. Always consult a healthcare professional for diagnosis and treatment.
            </Text>
          </View>
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
            <Text style={[styles.timestamp, isCurrentUser && styles.timestampUser]}>
              {formatTimestamp(message.timestamp)}
            </Text>
            {getStatusIconName() && (
              <Icon 
                name={getStatusIconName()!} 
                size={14} 
                color={isCurrentUser ? '#ffffff' : colors.text.secondary}
                style={[styles.statusIcon, isCurrentUser && styles.statusIconUser]}
              />
            )}
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
    backgroundColor: colors.mint.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#f5f3f7',
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
    backgroundColor: colors.mint.light,
    borderColor: colors.mint.primary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  messageTextWithIcon: {
    flex: 1,
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
    color: colors.mint.dark,
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
    fontSize: 11,
    color: colors.text.secondary,
    opacity: 0.8,
    fontWeight: '500',
  },
  timestampUser: {
    color: '#ffffff',
    opacity: 0.85,
  },
  statusIcon: {
    marginLeft: 4,
    opacity: 0.8,
  },
  statusIconUser: {
    opacity: 0.85,
  },
});