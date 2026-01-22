/**
 * Guardian Alerts screen for the I'm Okay app.
 * View and manage alert notifications from check-in events.
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Button, Card, Skeleton, SkeletonAlertItem } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';
import type { CheckIn, Profile } from '@/types/database';

type AlertType = 'missed' | 'late' | 'completed' | 'help';

interface Alert {
  id: string;
  type: AlertType;
  dependentId: string;
  dependentName: string;
  dependentPhone?: string | null;
  message: string;
  time: Date;
  read: boolean;
}

function AlertItem({ 
  alert, 
  onAction,
  onMarkRead,
}: { 
  alert: Alert; 
  onAction: (alert: Alert) => void;
  onMarkRead: (id: string) => void;
}) {
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
    help: {
      color: Colors.light.danger,
      icon: '🆘',
      actionLabel: 'Call Now',
    },
  };

  const config = typeConfig[alert.type];

  return (
    <TouchableOpacity
      onPress={() => !alert.read && onMarkRead(alert.id)}
      activeOpacity={0.8}
    >
      <Card style={[styles.alertCard, !alert.read && styles.alertCardUnread]}>
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
            onPress={() => onAction(alert)}
            accessibilityRole="button"
            accessibilityLabel={config.actionLabel}
          >
            <Text style={styles.alertActionText}>{config.actionLabel}</Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export default function GuardianAlertsScreen() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get guardian's relationships
      const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('dependent_id')
        .eq('guardian_id', user.id)
        .eq('status', 'active');

      if (relError) {
        setError(relError.message);
        setLoading(false);
        return;
      }

      const dependentIds = relationships
        ?.map(r => r.dependent_id)
        .filter((id): id is string => id !== null) || [];

      if (dependentIds.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      // Get dependent profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', dependentIds);

      // Get recent check-ins (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: checkIns, error: checkInsError } = await supabase
        .from('checkins')
        .select('*')
        .in('dependent_id', dependentIds)
        .gte('checked_in_at', yesterday.toISOString())
        .order('checked_in_at', { ascending: false });

      if (checkInsError) {
        console.error('Error fetching check-ins:', checkInsError);
      }

      // Convert check-ins to alerts
      const alertsFromCheckIns: Alert[] = (checkIns || []).map((checkIn: CheckIn) => {
        const profile = profiles?.find(p => p.id === checkIn.dependent_id);
        const name = profile?.display_name || 'Unknown';
        
        let type: AlertType = 'completed';
        let message = 'Checked in successfully';
        
        if (checkIn.status === 'missed') {
          type = 'missed';
          message = 'Missed their check-in window';
        } else if (checkIn.status === 'help_requested') {
          type = 'help';
          message = 'Requested help!';
        }

        return {
          id: checkIn.id,
          type,
          dependentId: checkIn.dependent_id,
          dependentName: name,
          dependentPhone: profile?.phone,
          message,
          time: new Date(checkIn.checked_in_at),
          read: type === 'completed', // Auto-mark completed as read
        };
      });

      setAlerts(alertsFromCheckIns);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Real-time subscription for new check-ins
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('guardian-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAlerts]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const handleAlertAction = (alert: Alert) => {
    if (alert.type === 'missed' || alert.type === 'help') {
      if (alert.dependentPhone) {
        Linking.openURL(`tel:${alert.dependentPhone}`);
      }
    } else if (alert.type === 'late') {
      handleMarkRead(alert.id);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View>
            <Skeleton width={80} height={28} style={styles.skeletonTitle} />
            <Skeleton width={100} height={16} />
          </View>
        </View>

        {/* Alerts List Skeleton */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <SkeletonAlertItem />
          <SkeletonAlertItem />
          <SkeletonAlertItem />
          <SkeletonAlertItem />
        </ScrollView>
      </SafeAreaView>
    );
  }

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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAlerts} />
        }
      >
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertItem 
              key={alert.id} 
              alert={alert} 
              onAction={handleAlertAction}
              onMarkRead={handleMarkRead}
            />
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
  errorBanner: {
    backgroundColor: Colors.light.danger + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.danger,
    textAlign: 'center',
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
  skeletonTitle: {
    marginBottom: Spacing.sm,
  },
});
