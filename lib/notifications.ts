/**
 * Push Notifications
 * 
 * Handles push notification registration, token management, and local notifications.
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications
 * Requests permissions and returns the Expo push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Android specific: create notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });

    // Create channel for check-in reminders
    await Notifications.setNotificationChannelAsync('checkin-reminders', {
      name: 'Check-in Reminders',
      description: 'Reminders to check in',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });

    // Create channel for alerts
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alerts',
      description: 'Missed check-in alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#E57373',
    });
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    
    console.log('Push token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Save push token to user profile in Supabase
 */
export async function savePushToken(token: string): Promise<void> {
  const db = supabase as any;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in, cannot save push token');
      return;
    }

    const { error } = await db
      .from('profiles')
      .update({ push_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      console.log('Push token saved successfully');
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

/**
 * Send a local notification
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  channelId?: string
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Immediate notification
  });

  return notificationId;
}

/**
 * Schedule a notification for a specific time
 */
export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, unknown>
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set badge count (iOS only)
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Add listener for received notifications (foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification responses (user tapped notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listener
 */
export function removeNotificationListener(subscription: Notifications.Subscription): void {
  subscription.remove();
}
