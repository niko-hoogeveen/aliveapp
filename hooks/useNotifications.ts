/**
 * Hook for managing push notifications.
 * Handles permission requests, token management, and notification listeners.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/stores/authStore';
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  clearBadge,
} from '@/lib/notifications';

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook to manage push notification registration and handling.
 * Should be used at the app's root level.
 */
export function useNotifications(): UseNotificationsReturn {
  const { user, profile } = useAuthStore();
  
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationReceivedRef = useRef<Notifications.EventSubscription | null>(null);
  const notificationResponseRef = useRef<Notifications.EventSubscription | null>(null);

  /**
   * Request permission and register for push notifications.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = await registerForPushNotifications();
      
      if (token) {
        setExpoPushToken(token);
        
        // Save token to profile if user is authenticated
        if (user) {
          await savePushToken(token);
        }
        
        return true;
      } else {
        setError('Failed to get push token');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register for notifications';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Only request if we don't have a token saved
    if (!profile?.push_token) {
      requestPermission();
    } else {
      setExpoPushToken(profile.push_token);
    }
  }, [user, profile?.push_token, requestPermission]);

  // Set up notification listeners
  useEffect(() => {
    // Handle notification received while app is in foreground
    notificationReceivedRef.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Handle notification tap
    notificationResponseRef.current = addNotificationResponseListener((response) => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      // Navigate based on notification data
      if (data?.route && typeof data.route === 'string') {
        router.navigate(data.route as '/(dependent)' | '/(guardian)');
      } else if (data?.dependentId && typeof data.dependentId === 'string') {
        // Guardian tapped a dependent-related notification
        router.navigate({
          pathname: '/(guardian)/[dependentId]',
          params: { dependentId: data.dependentId },
        });
      } else if (data?.type === 'checkin_reminder') {
        // Dependent tapped a check-in reminder
        router.navigate('/(dependent)');
      }

      // Clear badge when notification is tapped
      clearBadge();
    });

    // Check if app was opened from a notification
    getLastNotificationResponse().then((response) => {
      if (response) {
        console.log('App opened from notification:', response);
        const data = response.notification.request.content.data;
        
        if (data?.route && typeof data.route === 'string') {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            router.navigate(data.route as '/(dependent)' | '/(guardian)');
          }, 100);
        }
      }
    });

    // Clear badge when app becomes active
    clearBadge();

    return () => {
      notificationReceivedRef.current?.remove();
      notificationResponseRef.current?.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    loading,
    error,
    requestPermission,
  };
}
