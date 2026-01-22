/**
 * Shared layout for the I'm Okay app.
 * Stack navigator for screens accessible by both roles.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function SharedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Subscription',
        }}
      />
    </Stack>
  );
}
