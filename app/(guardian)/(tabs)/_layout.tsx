/**
 * Guardian Tabs layout for the I'm Okay app.
 * Tab navigator for guardian screens (Dashboard, Alerts, Add, Settings).
 */

import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants';

export default function GuardianTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>📊</Text>
          ),
          tabBarAccessibilityLabel: 'Dashboard - View dependents',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🔔</Text>
          ),
          tabBarAccessibilityLabel: 'Alerts - View notifications',
        }}
      />
      <Tabs.Screen
        name="add-dependent"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>➕</Text>
          ),
          tabBarAccessibilityLabel: 'Add dependent',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>⚙️</Text>
          ),
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.surface,
    borderTopColor: Colors.light.border,
    height: 84,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabBarLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  tabBarItem: {
    minHeight: 48, // Minimum touch target
  },
  tabIcon: {
    fontSize: 24,
  },
});
