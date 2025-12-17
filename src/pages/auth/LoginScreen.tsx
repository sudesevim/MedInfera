import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { authService } from '../../services/auth.service';
import { styles } from './LoginScreen.styles';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Missing Information', 'Please enter your password.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.signIn({ email: email.trim(), password });
      // Navigation will happen automatically via auth state change
    } catch (error: any) {
      // Show user-friendly error message
      const errorMessage = error.message || 'An error occurred during sign in.';
      
      Alert.alert(
        'Sign In Failed',
        errorMessage,
        [
          {
            text: 'OK',
            style: 'default',
          },
          ...(errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('sign up') ? [{
            text: 'Sign Up',
            onPress: () => navigation.navigate('SignUp'),
            style: 'default' as const,
          }] : []),
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Warning', 'Please enter your email address.');
      return;
    }

    try {
      await authService.resetPassword(email);
      Alert.alert('Success', 'Password reset link has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>MedInfera</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                disabled={loading}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
