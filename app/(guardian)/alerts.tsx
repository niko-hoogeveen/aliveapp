/**
 * Guardian Alerts Screen
 * 
 * Notification history and alert management.
 */

import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAlerts, Alert } from '@/hooks/useAlerts';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

/**
 * Format time since a date
 */
function formatTimeSince(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

/**
 * Get alert message
 */
function getAlertMessage(alert: Alert): string {
  switch (alert.type) {
    case 'completed':
      return 'Daily check-in completed';
    case 'missed':
      return 'Check-in was missed';
    case 'help_requested':
      return 'Help was requested';
    default:
      return 'Check-in notification';
  }
}

/**
 * Get alert icon
 */
function getAlertIcon(type: Alert['type']): string {
  switch (type) {
    case 'completed': return '✓';
    case 'missed': return '!';
    case 'help_requested': return '⚠️';
    default: return '•';
  }
}

export default function GuardianAlertsScreen() {
  const { alerts, loading, error, unreadCount, refreshAlerts, markAsRead, markAllAsRead } = useAlerts();

  const onRefresh = useCallback(async () => {
    await refreshAlerts();
  }, [refreshAlerts]);

  const handleAlertPress = (alert: Alert) => {
    markAsRead(alert.id);
    if (alert.dependent) {
      router.push(`/(guardian)/${alert.dependent.id}`);
    }
  };

  const handleCallPress = (alert: Alert) => {
    if (alert.dependent?.phone) {
      Linking.openURL(`tel:${alert.dependent.phone}`);
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'completed':
        return {
          bg: Colors.light.surface,
          border: Colors.light.border,
          iconBg: `${Colors.light.primary}20`,
          iconColor: Colors.light.primary,
        };
      case 'missed':
        return {
          bg: `${Colors.light.danger}10`,
          border: `${Colors.light.danger}30`,
          iconBg: `${Colors.light.danger}20`,
          iconColor: Colors.light.danger,
        };
      case 'help_requested':
        return {
          bg: `${Colors.light.warning}10`,
          border: `${Colors.light.warning}30`,
          iconBg: `${Colors.light.warning}20`,
          iconColor: Colors.light.warning,
        };
      default:
        return {
          bg: Colors.light.surface,
          border: Colors.light.border,
          iconBg: `${Colors.light.textSecondary}20`,
          iconColor: Colors.light.textSecondary,
        };
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up'}
          </Text>
        </View>

        {/* Quick Actions */}
        {alerts.length > 0 && (
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionButton} onPress={markAllAsRead}>
              <Text style={styles.quickActionText}>Mark All Read</Text>
            </Pressable>
          </View>
        )}

        {/* Alerts List */}
        <View style={styles.alertsList}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>No alerts</Text>
              <Text style={styles.emptyText}>
                Check-in notifications will appear here
              </Text>
            </View>
          ) : (
            alerts.map((alert) => {
              const style = getAlertStyle(alert.type);
              return (
                <Pressable
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    { backgroundColor: style.bg, borderColor: style.border },
                  ]}
                  onPress={() => handleAlertPress(alert)}
                >
                  {!alert.isRead && (alert.type === 'missed' || alert.type === 'help_requested') && (
                    <View style={styles.newIndicator} />
                  )}
                  <View style={[styles.alertIcon, { backgroundColor: style.iconBg }]}>
                    <Text style={{ color: style.iconColor, fontSize: 16 }}>
                      {getAlertIcon(alert.type)}
                    </Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertDependent}>
                      {alert.dependent?.display_name || 'Unknown'}
                    </Text>
                    <Text style={styles.alertMessage}>{getAlertMessage(alert)}</Text>
                    <Text style={styles.alertTime}>{formatTimeSince(alert.timestamp)}</Text>
                  </View>
                  
                  {/* Call button for urgent alerts */}
                  {(alert.type === 'missed' || alert.type === 'help_requested') && 
                    alert.dependent?.phone && (
                    <Pressable
                      style={styles.callButton}
                      onPress={() => handleCallPress(alert)}
                    >
                      <Text style={styles.callButtonText}>📞</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  quickActions: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  quickActionButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickActionText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
  alertsList: {
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
  },
  newIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.danger,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertDependent: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 2,
  },
  alertMessage: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  alertTime: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  callButtonText: {
    fontSize: 20,
  },
});
