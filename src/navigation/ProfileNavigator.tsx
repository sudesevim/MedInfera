import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen, EditProfileScreen, ChangePasswordScreen, EmergencyContactsScreen } from '../pages/profile';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EmergencyContacts" 
        component={EmergencyContactsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

