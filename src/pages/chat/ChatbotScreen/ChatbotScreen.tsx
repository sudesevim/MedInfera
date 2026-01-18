import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Platform,
  StatusBar,
  SafeAreaView,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import { authService } from '../../../services';
import { useChatState, useKeyboardBehavior, useAppLifecycle } from '../../../hooks';
import { MessageBubble, TypingIndicator, ChatInput, WelcomeAnimation } from '../../../components/chat';
import { ChatMessage } from '../../../types/chatbot.types';
import { styles } from './ChatbotScreen.styles';

export const ChatbotScreen: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  
  const { keyboardState, shouldAdjustForKeyboard } = useKeyboardBehavior();
  
  // App lifecycle management
  const appLifecycle = useAppLifecycle(currentUserId || '');
  
  // Initialize user authentication
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
      setIsInitialized(true);
    });

    return unsubscribe;
  }, []);

  // Chat state management (only initialize when user is available)
  const chatState = useChatState(currentUserId || '');
  
  // Debug: Log messages when they change
  useEffect(() => {
    console.log('📊 ChatbotScreen: Messages updated, count:', chatState.messages.length);
    console.log('📊 ChatbotScreen: Messages:', chatState.messages.map(m => ({
      id: m.id,
      sender: m.sender,
      content: m.content?.substring(0, 30) || 'NO CONTENT',
      hasContent: !!m.content
    })));
  }, [chatState.messages]);
  
  // Show welcome animation for new users
  useEffect(() => {
    if (isInitialized && currentUserId && chatState.messages.length === 0 && !chatState.isLoading) {
      setShowWelcomeAnimation(true);
    }
  }, [isInitialized, currentUserId, chatState.messages.length, chatState.isLoading]);
  
  // Save conversation state when app goes to background
  useEffect(() => {
    if (appLifecycle.appState === 'background' && currentUserId) {
      appLifecycle.saveConversationState({
        scrollPosition: 0, // Would be actual scroll position in real implementation
        inputText: chatState.inputText,
        lastMessageId: chatState.messages[0]?.id || null,
      });
      
      // Cache recent messages for offline access
      appLifecycle.saveCachedMessages(chatState.messages);
    }
  }, [appLifecycle.appState, currentUserId, chatState.inputText, chatState.messages]);
  
  // Restore conversation state when app comes to foreground
  useEffect(() => {
    if (appLifecycle.appState === 'active' && currentUserId && isInitialized) {
      appLifecycle.restoreConversationState().then(state => {
        if (state && state.inputText) {
          chatState.setInputText(state.inputText);
        }
      });
    }
  }, [appLifecycle.appState, currentUserId, isInitialized]);

  // Memoize renderMessage to prevent unnecessary re-renders
  const renderMessage = React.useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = item.sender === 'user';
    // Show timestamp for first message or if 5 minutes passed since previous message
    const showTimestamp = index === 0 || 
      (index > 0 && chatState.messages[index - 1] && 
       new Date(item.timestamp).getTime() - new Date(chatState.messages[index - 1].timestamp).getTime() > 300000); // 5 minutes

    console.log('🎨 ChatbotScreen: Rendering message:', {
      id: item.id,
      sender: item.sender,
      content: item.content?.substring(0, 30) || 'NO CONTENT',
      hasContent: !!item.content,
      contentLength: item.content?.length || 0
    });

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showTimestamp={showTimestamp}
      />
    );
  }, [chatState.messages]);

  // Memoize keyExtractor
  const keyExtractor = React.useCallback((item: ChatMessage) => item.id, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Health Assistant</Text>
          <Text style={styles.headerSubtitle}>MedInfera AI Chatbot</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClearConversation}
      >
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyLogoContainer}>
        <Image 
          source={require('../../../assets/images/logo.png')} 
          style={styles.emptyLogo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.emptyTitle}>Your Health Assistant is Ready</Text>
      <Text style={styles.emptyDescription}>
        Ask health questions, share symptoms, and get general health information.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (chatState.isTyping) {
      return <TypingIndicator visible={true} />;
    }
    return null;
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'All message history will be deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: chatState.clearConversation 
        },
      ]
    );
  };

  const handleSendMessage = async (message: string) => {
    try {
      await chatState.sendMessage(message);
    } catch (error: any) {
      Alert.alert(
          'Failed to Send Message',
          error.message || 'An error occurred. Please try again.',
          [{ text: 'OK' }]
      );
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        {Platform.OS === 'android' && (
          <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
        )}
        {Platform.OS === 'ios' && (
          <StatusBar barStyle="light-content" />
        )}
        <SafeAreaView style={styles.safeArea} />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Starting health assistant...</Text>
        </View>
      </View>
    );
  }

  // Show error if user not authenticated
  if (!currentUserId) {
    return (
      <View style={styles.container}>
        {Platform.OS === 'android' && (
          <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
        )}
        {Platform.OS === 'ios' && (
          <StatusBar barStyle="light-content" />
        )}
        <SafeAreaView style={styles.safeArea} />
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🔒</Text>
          <Text style={styles.errorTitle}>Login Required</Text>
          <Text style={styles.errorDescription}>
            Please sign in to use the health assistant.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      )}
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="light-content" />
      )}
      <SafeAreaView style={styles.safeArea} />

      {renderHeader()}

      {chatState.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{chatState.error}</Text>
          <TouchableOpacity onPress={chatState.clearError}>
            <Text style={styles.errorBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[
        styles.messagesContainer,
        shouldAdjustForKeyboard && { marginBottom: keyboardState.height }
      ]}>
        {chatState.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatState.messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // Performance optimizations
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
            getItemLayout={undefined} // Cannot use with variable height items
            onLayout={() => {
              console.log('📋 ChatbotScreen: FlatList onLayout, messages count:', chatState.messages.length);
              // Scroll to bottom when list is first rendered
              if (chatState.messages.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }
            }}
            onContentSizeChange={() => {
              console.log('📋 ChatbotScreen: FlatList onContentSizeChange, messages count:', chatState.messages.length);
              // Auto-scroll to bottom when new messages arrive
              if (chatState.messages.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            }}
          />
        )}
      </View>

      <ChatInput
        onSend={handleSendMessage}
        disabled={chatState.isTyping}
        placeholder="Ask about your health..."
      />

      <WelcomeAnimation
        visible={showWelcomeAnimation}
        onComplete={() => setShowWelcomeAnimation(false)}
      />
    </View>
  );
};
