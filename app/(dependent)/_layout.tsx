/**
 * Dependent Layout
 * 
 * Tab navigator for dependent screens with Stack for modal screens.
 */

import { Tabs, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function DependentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarLabel: 'Help',
        }}
      />
      <Tabs.Screen
        name="join"
        options={{
          // Hide from tab bar - accessed via navigation
          href: null,
        }}
      />
    </Tabs>
  );
}
