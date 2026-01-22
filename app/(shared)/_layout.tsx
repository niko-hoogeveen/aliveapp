/**
 * Shared Layout
 * 
 * Stack navigator for screens accessible to both roles.
 */

import { Stack } from 'expo-router';

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
