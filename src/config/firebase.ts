import { FirebaseApp } from '@react-native-firebase/app';

// Firebase configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// Get your config from Firebase Console: https://console.firebase.google.com/
// For React Native Firebase, the actual configuration is loaded from:
// - iOS: ios/MedInfera/GoogleService-Info.plist
// - Android: android/app/google-services.json
// These files are gitignored for security. You need to add your own Firebase config files.

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY_HERE',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:ios:abcdef123456',
};

// Firebase is automatically initialized by @react-native-firebase/app
// The actual initialization uses GoogleService-Info.plist (iOS) and google-services.json (Android)
// No need to call initializeApp() manually in React Native













