// App Lifecycle Hook
// Manages app state preservation during backgrounding/foregrounding and offline mode

import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
// Note: AsyncStorage would be imported here in a real implementation
// For now, we'll use a simple in-memory storage simulation
import { ChatMessage } from '../types/chatbot.types';

interface AppLifecycleState {
  appState: AppStateStatus;
  isOnline: boolean;
  lastActiveTime: Date | null;
  conversationState: {
    scrollPosition: number;
    inputText: string;
    lastMessageId: string | null;
  } | null;
}

interface UseAppLifecycleReturn {
  appState: AppStateStatus;
  isOnline: boolean;
  isAppActive: boolean;
  saveConversationState: (state: {
    scrollPosition: number;
    inputText: string;
    lastMessageId: string | null;
  }) => Promise<void>;
  restoreConversationState: () => Promise<{
    scrollPosition: number;
    inputText: string;
    lastMessageId: string | null;
  } | null>;
  saveCachedMessages: (messages: ChatMessage[]) => Promise<void>;
  getCachedMessages: () => Promise<ChatMessage[]>;
  clearCache: () => Promise<void>;
}

// Simple in-memory storage simulation (replace with AsyncStorage in production)
const memoryStorage: { [key: string]: string } = {};

const simpleStorage = {
  setItem: async (key: string, value: string) => {
    memoryStorage[key] = value;
  },
  getItem: async (key: string) => {
    return memoryStorage[key] || null;
  },
  removeItem: async (key: string) => {
    delete memoryStorage[key];
  },
};

const STORAGE_KEYS = {
  CONVERSATION_STATE: '@medical_chatbot_conversation_state',
  CACHED_MESSAGES: '@medical_chatbot_cached_messages',
  LAST_ACTIVE: '@medical_chatbot_last_active',
};

export const useAppLifecycle = (userId: string): UseAppLifecycleReturn => {
  const [lifecycleState, setLifecycleState] = useState<AppLifecycleState>({
    appState: AppState.currentState,
    isOnline: true, // Assume online initially
    lastActiveTime: null,
    conversationState: null,
  });

  const appStateRef = useRef(AppState.currentState);
  const onlineStatusRef = useRef(true);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      
      if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground');
        handleAppForeground();
      } else if (previousAppState === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        console.log('App has gone to the background');
        handleAppBackground();
      }

      appStateRef.current = nextAppState;
      setLifecycleState(prev => ({
        ...prev,
        appState: nextAppState,
      }));
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Monitor network connectivity (simplified - in real app would use NetInfo)
  useEffect(() => {
    // Simulate network monitoring
    const checkConnectivity = () => {
      // In a real implementation, you would use @react-native-community/netinfo
      // For now, we'll assume the app is always online
      const isOnline = true;
      
      if (isOnline !== onlineStatusRef.current) {
        onlineStatusRef.current = isOnline;
        setLifecycleState(prev => ({
          ...prev,
          isOnline,
        }));
        
        if (isOnline) {
          handleConnectionRestored();
        } else {
          handleConnectionLost();
        }
      }
    };

    const interval = setInterval(checkConnectivity, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAppForeground = async () => {
    try {
      // Restore last active time
      const lastActiveStr = await simpleStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
      const lastActiveTime = lastActiveStr ? new Date(lastActiveStr) : null;
      
      setLifecycleState(prev => ({
        ...prev,
        lastActiveTime,
      }));

      // Check if we need to sync messages or refresh state
      if (lastActiveTime) {
        const timeDiff = new Date().getTime() - lastActiveTime.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        if (minutesDiff > 5) {
          // App was backgrounded for more than 5 minutes, might need refresh
          console.log('App was backgrounded for', minutesDiff, 'minutes');
        }
      }
    } catch (error) {
      console.error('Error handling app foreground:', error);
    }
  };

  const handleAppBackground = async () => {
    try {
      // Save current time as last active
      const currentTime = new Date().toISOString();
      await simpleStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, currentTime);
      
      console.log('App backgrounded, state saved');
    } catch (error) {
      console.error('Error handling app background:', error);
    }
  };

  const handleConnectionRestored = () => {
    console.log('Connection restored');
    // Trigger message sync if needed
  };

  const handleConnectionLost = () => {
    console.log('Connection lost, entering offline mode');
  };

  const saveConversationState = async (state: {
    scrollPosition: number;
    inputText: string;
    lastMessageId: string | null;
  }) => {
    try {
      const stateWithUserId = {
        ...state,
        userId,
        timestamp: new Date().toISOString(),
      };
      
      await simpleStorage.setItem(
        STORAGE_KEYS.CONVERSATION_STATE,
        JSON.stringify(stateWithUserId)
      );
    } catch (error) {
      console.error('Error saving conversation state:', error);
    }
  };

  const restoreConversationState = async () => {
    try {
      const stateStr = await simpleStorage.getItem(STORAGE_KEYS.CONVERSATION_STATE);
      if (!stateStr) return null;
      
      const state = JSON.parse(stateStr);
      
      // Check if state belongs to current user
      if (state.userId !== userId) {
        return null;
      }
      
      // Check if state is not too old (e.g., more than 24 hours)
      const stateTime = new Date(state.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - stateTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // State is too old, clear it
        await simpleStorage.removeItem(STORAGE_KEYS.CONVERSATION_STATE);
        return null;
      }
      
      return {
        scrollPosition: state.scrollPosition || 0,
        inputText: state.inputText || '',
        lastMessageId: state.lastMessageId || null,
      };
    } catch (error) {
      console.error('Error restoring conversation state:', error);
      return null;
    }
  };

  const saveCachedMessages = async (messages: ChatMessage[]) => {
    try {
      // Only cache recent messages to save storage space
      const recentMessages = messages.slice(0, 50);
      
      const cacheData = {
        userId,
        messages: recentMessages,
        timestamp: new Date().toISOString(),
      };
      
      await simpleStorage.setItem(
        STORAGE_KEYS.CACHED_MESSAGES,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error saving cached messages:', error);
    }
  };

  const getCachedMessages = async (): Promise<ChatMessage[]> => {
    try {
      const cacheStr = await simpleStorage.getItem(STORAGE_KEYS.CACHED_MESSAGES);
      if (!cacheStr) return [];
      
      const cacheData = JSON.parse(cacheStr);
      
      // Check if cache belongs to current user
      if (cacheData.userId !== userId) {
        return [];
      }
      
      // Check if cache is not too old
      const cacheTime = new Date(cacheData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 6) {
        // Cache is too old, clear it
        await simpleStorage.removeItem(STORAGE_KEYS.CACHED_MESSAGES);
        return [];
      }
      
      // Convert timestamp strings back to Date objects
      return cacheData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        simpleStorage.removeItem(STORAGE_KEYS.CONVERSATION_STATE),
        simpleStorage.removeItem(STORAGE_KEYS.CACHED_MESSAGES),
        simpleStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE),
      ]);
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return {
    appState: lifecycleState.appState,
    isOnline: lifecycleState.isOnline,
    isAppActive: lifecycleState.appState === 'active',
    saveConversationState,
    restoreConversationState,
    saveCachedMessages,
    getCachedMessages,
    clearCache,
  };
};