// Typing Indicator Component for Medical Chatbot
// Shows animated typing indicator when bot is generating response

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { colors } from '../../theme';

interface TypingIndicatorProps {
  visible: boolean;
  estimatedTime?: number;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  visible,
  estimatedTime,
}) => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show container
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Start typing animation
      startTypingAnimation();
    } else {
      // Hide container
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const startTypingAnimation = () => {
    const animateDot = (dotOpacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with staggered delays
    Animated.parallel([
      animateDot(dot1Opacity, 0),
      animateDot(dot2Opacity, 200),
      animateDot(dot3Opacity, 400),
    ]).start();
  };

  const formatEstimatedTime = (seconds?: number): string => {
    if (!seconds) return '';
    
    if (seconds < 60) {
      return `~${Math.ceil(seconds)} seconds`;
    }
    
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} minutes`;
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
    >
      <View style={styles.bubble}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot1Opacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot2Opacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot3Opacity,
                },
              ]}
            />
          </View>
          
          <Text style={styles.typingText}>
            Medical assistant is typing...
          </Text>
          
          {estimatedTime && (
            <Text style={styles.estimatedTime}>
              {formatEstimatedTime(estimatedTime)}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    marginRight: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  estimatedTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    opacity: 0.7,
  },
});