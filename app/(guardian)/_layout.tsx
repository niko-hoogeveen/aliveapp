/**
 * Guardian Layout
 * 
 * Tab navigator for guardian screens.
 */

import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function GuardianLayout() {
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
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
        }}
      />
      <Tabs.Screen
        name="add-dependent"
        options={{
          title: 'Add',
          tabBarLabel: 'Add',
        }}
      />
      <Tabs.Screen
        name="[dependentId]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
