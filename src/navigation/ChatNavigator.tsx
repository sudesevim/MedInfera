import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatbotScreen } from '../pages/chat';

const Stack = createNativeStackNavigator();

export const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ChatbotMain" component={ChatbotScreen} />
    </Stack.Navigator>
  );
};










