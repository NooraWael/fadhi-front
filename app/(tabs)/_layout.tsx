import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Updated TabBarIcon component using Feather icons for consistency
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Defensive check - make sure Colors and colorScheme exist
  const currentColors = Colors?.[colorScheme] || Colors?.light || {
    primary: '#C41E3A',
    text: '#8B1538',
    background: '#FAF7F0',
    border: '#E8B4A0',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: currentColors.text + '80', // Add transparency
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      
      {/* Chats Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'message-circle' : 'message-circle'} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Contacts Tab */}
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'users' : 'users'} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'user' : 'user'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}