import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../pages/home';
import { SymptomsScreen } from '../pages/symptoms';

const Stack = createNativeStackNavigator();

export const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="Symptoms" 
        component={SymptomsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

