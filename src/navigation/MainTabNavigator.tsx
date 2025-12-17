/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeNavigator } from './HomeNavigator';
import { HealthNavigator } from './HealthNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ChatbotScreen } from '../pages/chat';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  color: string;
  focused: boolean;
  iconName: string;
}

const TabIcon = React.memo<TabIconProps>(({ color, focused, iconName }) => {
  return (
    <Icon 
      name={iconName} 
      size={24} 
      color={color}
      style={{ opacity: focused ? 1 : 0.6 } as any}
    />
  );
});

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.surface,
        tabBarInactiveTintColor: colors.primary[200],
        tabBarStyle: {
          backgroundColor: colors.primary[600],
          borderTopWidth: 0,
          paddingBottom: 4,
          paddingTop: 2,
          height: 70,
          elevation: 8,
          shadowColor: colors.primary[900],
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerStyle: {
          backgroundColor: colors.primary[800],
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.surface,
        },
        headerTintColor: colors.surface,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} iconName={focused ? 'home' : 'home-outline'} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthNavigator}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} iconName={focused ? 'medical' : 'medical-outline'} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} iconName={focused ? 'chatbubbles' : 'chatbubbles-outline'} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} iconName={focused ? 'person' : 'person-outline'} />
          ),
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

