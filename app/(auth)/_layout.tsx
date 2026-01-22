/**
 * Auth layout for the I'm Okay app.
 * Stack navigator for login, signup, and role selection screens.
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function AuthLayout() {
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
        name="login"
        options={{
          title: 'Log In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="role-select"
        options={{
          title: 'Choose Your Role',
          headerBackTitle: 'Back',
          // Prevent going back after role selection
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
