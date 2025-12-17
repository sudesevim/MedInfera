import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HealthHistoryScreen, HealthStatsScreen } from '../pages/health';
import { MedicationsScreen } from '../pages/medications';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const HealthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HealthHistory"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HealthHistory" component={HealthHistoryScreen} />
      <Stack.Screen 
        name="HealthStats" 
        component={HealthStatsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Medications" 
        component={MedicationsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

