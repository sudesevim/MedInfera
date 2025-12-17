/**
 * MedInfera App
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@react-native-firebase/app'; // Firebase'i başlat
import { RootNavigator } from './src/navigation/RootNavigator';
import { HealthDataProvider } from './src/contexts/HealthDataContext';

function App() {
  return (
    <SafeAreaProvider>
      <HealthDataProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <RootNavigator />
      </HealthDataProvider>
    </SafeAreaProvider>
  );
}

export default App;
