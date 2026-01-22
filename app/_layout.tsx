/**
 * Root Layout
 * 
 * This is the main entry point for the app's navigation.
 * It sets up the SafeAreaProvider, AuthProvider, and handles auth state routing.
 * Supports UI preview mode for inspecting screens without authentication.
 */

import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Pressable } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { isPreviewMode } from '@/lib/supabase';
import { 
  registerForPushNotifications, 
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/lib/notifications';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Preview Mode Banner - shows navigation options when in preview mode
 */
function PreviewModeBanner() {
  const router = useRouter();
  const { profile, setPreviewRole } = useAuth();

  const navigateTo = (route: string, role?: 'guardian' | 'dependent') => {
    if (role) {
      setPreviewRole(role);
    }
    router.push(route as any);
  };

  return (
    <View style={styles.previewBanner}>
      <Text style={styles.previewTitle}>🎨 UI Preview Mode</Text>
      <View style={styles.previewButtons}>
        <Pressable 
          style={styles.previewButton} 
          onPress={() => navigateTo('/(auth)/login')}
        >
          <Text style={styles.previewButtonText}>Login</Text>
        </Pressable>
        <Pressable 
          style={styles.previewButton} 
          onPress={() => navigateTo('/(auth)/role-select')}
        >
          <Text style={styles.previewButtonText}>Role Select</Text>
        </Pressable>
        <Pressable 
          style={[styles.previewButton, styles.previewButtonDependent]} 
          onPress={() => navigateTo('/(dependent)', 'dependent')}
        >
          <Text style={styles.previewButtonText}>Dependent</Text>
        </Pressable>
        <Pressable 
          style={[styles.previewButton, styles.previewButtonGuardian]} 
          onPress={() => navigateTo('/(guardian)', 'guardian')}
        >
          <Text style={styles.previewButtonText}>Guardian</Text>
        </Pressable>
      </View>
      {profile?.role && (
        <Text style={styles.previewRole}>Current role: {profile.role}</Text>
      )}
    </View>
  );
}

/**
 * Navigation handler that redirects based on auth state
 * In preview mode, allows free navigation
 */
function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, isPreviewMode: authPreviewMode } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    // Skip redirects in preview mode - allow free navigation
    if (isPreviewMode || authPreviewMode) {
      return;
    }

    if (loading) return;

    const firstSegment = segments[0] || '';
    const secondSegment = segments[1] || '';
    const inAuthGroup = firstSegment === '(auth)';

    if (!session) {
      // Not signed in, redirect to auth
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!profile?.role) {
      // Signed in but no role selected, redirect to role select
      if (secondSegment !== 'role-select') {
        router.replace('/(auth)/role-select');
      }
    } else {
      // Signed in with role, redirect to appropriate home
      if (inAuthGroup) {
        if (profile.role === 'dependent') {
          router.replace('/(dependent)');
        } else {
          router.replace('/(guardian)');
        }
      }
    }
  }, [session, profile, loading, segments, authPreviewMode]);

  return <>{children}</>;
}

/**
 * Loading screen shown while auth state is being determined
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </View>
  );
}

/**
 * Inner layout component that uses auth context
 */
function RootLayoutNav() {
  const { loading, session, isPreviewMode: authPreviewMode } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Hide splash screen after auth state is determined
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Register for push notifications when user is authenticated (skip in preview mode)
  useEffect(() => {
    if (isPreviewMode || authPreviewMode) return;

    if (!loading && session) {
      // Register for push notifications
      registerForPushNotifications().then((token) => {
        if (token) {
          savePushToken(token);
        }
      });

      // Set up notification listeners
      notificationListener.current = addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

      responseListener.current = addNotificationResponseListener((response) => {
        console.log('Notification response:', response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        // TODO: Navigate based on notification type
      });

      return () => {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      };
    }
  }, [loading, session, authPreviewMode]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationHandler>
      <View style={styles.container}>
        {/* Show preview banner when in preview mode */}
        {isPreviewMode && <PreviewModeBanner />}
        
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(dependent)" />
            <Stack.Screen name="(guardian)" />
            <Stack.Screen name="(shared)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </View>
    </NavigationHandler>
  );
}

/**
 * Root Layout with providers
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  previewBanner: {
    backgroundColor: Colors.light.accent,
    padding: Spacing.sm,
    paddingTop: Spacing.xl,
  },
  previewTitle: {
    ...Typography.bodySmall,
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  previewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  previewButtonDependent: {
    backgroundColor: Colors.light.primary,
  },
  previewButtonGuardian: {
    backgroundColor: Colors.light.primaryDark,
  },
  previewButtonText: {
    ...Typography.caption,
    color: Colors.light.surface,
    fontWeight: '600',
  },
  previewRole: {
    ...Typography.caption,
    color: Colors.light.surface,
    textAlign: 'center',
    marginTop: Spacing.xs,
    opacity: 0.8,
  },
});
