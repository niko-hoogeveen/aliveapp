/**
 * Dependent layout for the I'm Okay app.
 * Tab navigator for dependent screens (Home, Help, Settings).
 */

import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants';

export default function DependentLayout() {
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>🏠</Text>
          ),
          tabBarAccessibilityLabel: 'Home - Check in',
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>🆘</Text>
          ),
          tabBarAccessibilityLabel: 'Help - Emergency contacts',
        }}
      />
      <Tabs.Screen
        name="join"
        options={{
          title: 'Join',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>🔗</Text>
          ),
          tabBarAccessibilityLabel: 'Join - Enter invite code',
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
