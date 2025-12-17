// Keyboard Behavior Hook
// Manages keyboard visibility and interface adaptation

import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  animationDuration: number;
}

interface UseKeyboardBehaviorReturn {
  keyboardState: KeyboardState;
  adjustedHeight: number;
  shouldAdjustForKeyboard: boolean;
}

export const useKeyboardBehavior = (): UseKeyboardBehaviorReturn => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    animationDuration: 250,
  });

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleKeyboardShow = (event: KeyboardEvent) => {
    setKeyboardState({
      isVisible: true,
      height: event.endCoordinates.height,
      animationDuration: event.duration || 250,
    });
  };

  const handleKeyboardHide = (event: KeyboardEvent) => {
    setKeyboardState({
      isVisible: false,
      height: 0,
      animationDuration: event.duration || 250,
    });
  };

  // Calculate adjusted height for content
  const adjustedHeight = keyboardState.isVisible 
    ? keyboardState.height - (Platform.OS === 'ios' ? 34 : 0) // Account for safe area
    : 0;

  const shouldAdjustForKeyboard = keyboardState.isVisible && keyboardState.height > 0;

  return {
    keyboardState,
    adjustedHeight,
    shouldAdjustForKeyboard,
  };
};