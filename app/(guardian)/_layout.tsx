/**
 * Guardian layout for the I'm Okay app.
 * Stack navigator that contains tabs and the dependent detail screen.
 * This structure enables swipe-back gesture navigation from detail screens.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function GuardianLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      {/* Tabs are the main screen */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      {/* Dependent detail screen with swipe-back gesture */}
      <Stack.Screen
        name="[dependentId]"
        options={{
          headerShown: false, // We use a custom header in the screen
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack>
  );
}
