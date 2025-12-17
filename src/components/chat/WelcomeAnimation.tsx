// Welcome Animation Component
// Provides a smooth animated introduction for new users

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { colors } from '../../theme';

interface WelcomeAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  visible,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>MedInfera AI</Text>
        <Text style={styles.subtitle}>Your Health Assistant is Ready</Text>
        
        <View style={styles.features}>
          <Text style={styles.feature}>🩺 Health Consultation</Text>
          <Text style={styles.feature}>💊 Medication Management</Text>
          <Text style={styles.feature}>🚨 Emergency Support</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(168, 85, 247, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary[100],
    marginBottom: 32,
    textAlign: 'center',
  },
  features: {
    alignItems: 'center',
  },
  feature: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
});