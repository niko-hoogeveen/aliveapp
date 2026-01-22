/**
 * Root layout for the I'm Okay app.
 * Handles authentication state and navigation stack.
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  // TODO: Replace with actual auth state from useAuth hook
  const [session, setSession] = useState<null | object>(null);
  const loading = !isReady;

  useEffect(() => {
    // Initialize app resources
    async function prepare() {
      try {
        // TODO: Load fonts, initialize Supabase auth listener, etc.
        // await Font.loadAsync({ ... });
        
        // Simulate loading for now
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Error loading app resources:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner centered size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth screens - shown when not logged in */}
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              // Prevent going back to auth screens after login
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
          
          {/* 404 screen */}
          <Stack.Screen 
            name="+not-found" 
            options={{ title: 'Not Found' }} 
          />
        </Stack>
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
