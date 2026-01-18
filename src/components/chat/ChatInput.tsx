// Chat Input Component for Medical Chatbot
// Handles message composition and sending with validation

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../../theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  multiline?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Ask about your health...',
  disabled = false,
  maxLength = 1000,
  multiline = true,
}) => {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const textInputRef = useRef<TextInput>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    
    // Validate message
    if (!trimmedMessage) {
      Alert.alert(
        'Boş Mesaj',
        'Lütfen bir mesaj yazın.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    if (trimmedMessage.length > maxLength) {
      Alert.alert(
        'Mesaj Çok Uzun',
        `Mesajınız ${maxLength} karakterden uzun olamaz.`,
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Send message
    onSend(trimmedMessage);
    
    // Clear input and reset height
    setMessage('');
    setInputHeight(40);
    
    // Maintain focus
    textInputRef.current?.focus();
  };

  const handleContentSizeChange = (event: any) => {
    if (multiline) {
      const { height } = event.nativeEvent.contentSize;
      // Limit height to prevent excessive growth
      const newHeight = Math.min(Math.max(40, height), 120);
      setInputHeight(newHeight);
    }
  };

  const getCharacterCount = (): string => {
    const remaining = maxLength - message.length;
    if (remaining < 100) {
      return `${remaining} karakter kaldı`;
    }
    return '';
  };

  const isMessageValid = (): boolean => {
    const trimmed = message.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              {
                height: inputHeight,
              },
              disabled && styles.disabledInput,
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={colors.text.secondary}
            multiline={multiline}
            maxLength={maxLength}
            editable={!disabled}
            onContentSizeChange={handleContentSizeChange}
            textAlignVertical="top"
            returnKeyType="send"
            onSubmitEditing={multiline ? undefined : handleSend}
            blurOnSubmit={!multiline}
          />
          
          {getCharacterCount() && (
            <Text style={styles.characterCount}>
              {getCharacterCount()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            isMessageValid() && !disabled ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          onPress={handleSend}
          disabled={!isMessageValid() || disabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.sendButtonText,
              isMessageValid() && !disabled ? styles.sendButtonTextActive : styles.sendButtonTextInactive,
            ]}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>

      {disabled && (
        <View style={styles.disabledOverlay}>
          <Text style={styles.disabledText}>
            Waiting for response...
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.primary[200],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  textInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: '#ffffff',
    maxHeight: 120,
  },
  disabledInput: {
    backgroundColor: colors.primary[50],
    color: colors.text.secondary,
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary[600],
  },
  sendButtonInactive: {
    backgroundColor: colors.primary[600],
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextActive: {
    color: '#ffffff',
  },
  sendButtonTextInactive: {
    color: '#ffffff',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});