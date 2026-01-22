/**
 * Guardian Alerts screen for the I'm Okay app.
 * View and manage alert notifications.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

type AlertType = 'missed' | 'late' | 'completed';

interface Alert {
  id: string;
  type: AlertType;
  dependentName: string;
  message: string;
  time: Date;
  read: boolean;
}

function AlertItem({ alert, onAction }: { alert: Alert; onAction: (id: string) => void }) {
  const typeConfig = {
    missed: {
      color: Colors.light.danger,
      icon: '🚨',
      actionLabel: 'Call Now',
    },
    late: {
      color: Colors.light.accent,
      icon: '⏰',
      actionLabel: 'Dismiss',
    },
    completed: {
      color: Colors.light.primary,
      icon: '✓',
      actionLabel: null,
    },
  };

  const config = typeConfig[alert.type];

  const cardStyle = [styles.alertCard, !alert.read ? styles.alertCardUnread : undefined];

  return (
    <Card style={cardStyle}>
      <View style={styles.alertHeader}>
        <View style={[styles.alertIcon, { backgroundColor: config.color + '20' }]}>
          <Text style={styles.alertIconText}>{config.icon}</Text>
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.dependentName}</Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertTime}>
            {alert.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      {config.actionLabel && (
        <TouchableOpacity
          style={[styles.alertAction, { backgroundColor: config.color }]}
          onPress={() => onAction(alert.id)}
          accessibilityRole="button"
          accessibilityLabel={config.actionLabel}
        >
          <Text style={styles.alertActionText}>{config.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

export default function GuardianAlertsScreen() {
  // TODO: Fetch from Supabase with realtime subscription
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'completed',
      dependentName: 'Mom',
      message: 'Checked in successfully',
      time: new Date(),
      read: false,
    },
  ]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleAlertAction = (id: string) => {
    console.log('Alert action:', id);
    // TODO: Implement alert actions (call, dismiss)
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onPress={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onAction={handleAlertAction} />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyText}>
              Everyone is checking in on time. Great job!
            </Text>
          </Card>
        )}

        {/* Alert Settings Promo */}
        <Card style={styles.promoCard}>
          <Text style={styles.promoTitle}>💡 Alert Settings</Text>
          <Text style={styles.promoText}>
            Customize how you receive notifications in Settings.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  alertCard: {
    marginBottom: Spacing.sm,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  alertIconText: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  alertMessage: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  alertTime: {
    ...Typography.caption,
    color: Colors.light.textDisabled,
    marginTop: Spacing.xs,
  },
  alertAction: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  alertActionText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
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
  promoCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
  },
  promoTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  promoText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
});
