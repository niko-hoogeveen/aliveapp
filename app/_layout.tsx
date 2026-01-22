/**
 * Root layout for the I'm Okay app.
 * Handles authentication state, navigation stack, and notifications.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuthContext } from '@/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Component to initialize notifications.
 * Must be inside AuthProvider to access user state.
 */
function NotificationInitializer() {
  // Initialize notifications - handles permission request and token saving
  useNotifications();
  return null;
}

function RootLayoutNav() {
  const { initialized, loading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();
    }
  }, [initialized]);

  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner centered size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {/* Initialize notifications when user is authenticated */}
      {isAuthenticated && <NotificationInitializer />}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens - shown when not logged in */}
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        
        {/* Dependent screens */}
        <Stack.Screen 
          name="(dependent)" 
          options={{ headerShown: false }} 
        />
        
        {/* Guardian screens */}
        <Stack.Screen 
          name="(guardian)" 
          options={{ headerShown: false }} 
        />
        
        {/* Shared screens (settings, subscription) */}
        <Stack.Screen 
          name="(shared)" 
          options={{ headerShown: false }} 
        />
        
        {/* Index redirect */}
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        
        {/* 404 screen */}
        <Stack.Screen 
          name="+not-found" 
          options={{ title: 'Not Found' }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
