/**
 * Dependent Detail screen for the I'm Okay app.
 * View detailed information about a specific dependent.
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button, Card, Skeleton, SkeletonProfileHeader, SkeletonCard } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import type { Profile, CheckIn } from '@/types/database';

type DependentStatus = 'ok' | 'pending' | 'missed';

interface DependentData extends Profile {
  status: DependentStatus;
  lastCheckIn: CheckIn | null;
  recentCheckIns: CheckIn[];
}

export default function DependentDetailScreen() {
  const { dependentId } = useLocalSearchParams<{ dependentId: string }>();
  const [dependent, setDependent] = useState<DependentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDependentData = useCallback(async () => {
    if (!dependentId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', dependentId)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // Fetch today's check-ins
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayCheckIns, error: checkInsError } = await supabase
        .from('checkins')
        .select('*')
        .eq('dependent_id', dependentId)
        .gte('checked_in_at', todayStart.toISOString())
        .order('checked_in_at', { ascending: false });

      if (checkInsError) {
        console.error('Error fetching check-ins:', checkInsError);
      }

      // Fetch recent history (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: recentCheckIns } = await supabase
        .from('checkins')
        .select('*')
        .eq('dependent_id', dependentId)
        .gte('checked_in_at', weekAgo.toISOString())
        .order('checked_in_at', { ascending: false })
        .limit(10);

      // Determine status
      const hasCheckedInToday = (todayCheckIns?.length || 0) > 0;
      const status: DependentStatus = hasCheckedInToday ? 'ok' : 'pending';

      setDependent({
        ...profile,
        status,
        lastCheckIn: todayCheckIns?.[0] || null,
        recentCheckIns: recentCheckIns || [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [dependentId]);

  useEffect(() => {
    fetchDependentData();
  }, [fetchDependentData]);

  // Real-time subscription for check-ins
  useEffect(() => {
    if (!dependentId) return;

    const channel = supabase
      .channel(`dependent-${dependentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `dependent_id=eq.${dependentId}`,
        },
        () => {
          fetchDependentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dependentId, fetchDependentData]);

  const statusColors = {
    ok: Colors.light.primary,
    pending: Colors.light.accent,
    missed: Colors.light.danger,
  };

  const statusLabels = {
    ok: 'Checked in',
    pending: 'Pending',
    missed: 'Missed',
  };

  const handleCall = () => {
    if (dependent?.phone) {
      Linking.openURL(`tel:${dependent.phone}`);
    }
  };

  const handleMessage = () => {
    if (dependent?.phone) {
      Linking.openURL(`sms:${dependent.phone}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Custom header component
  const Header = ({ title }: { title: string }) => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={handleGoBack} 
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back to dashboard"
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (loading && !dependent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title="" />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Profile Header Skeleton */}
          <SkeletonProfileHeader />

          {/* Status Card Skeleton */}
          <SkeletonCard style={styles.skeletonCard} />

          {/* Quick Actions Skeleton */}
          <View style={styles.skeletonActions}>
            <Skeleton width="45%" height={44} borderRadius={BorderRadius.md} />
            <Skeleton width="45%" height={44} borderRadius={BorderRadius.md} />
          </View>

          {/* Check-in History Skeleton */}
          <View style={styles.skeletonSection}>
            <Skeleton width={140} height={20} style={styles.skeletonSectionTitle} />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !dependent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title="Error" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Dependent not found'}</Text>
          <Button variant="primary" onPress={fetchDependentData}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = dependent.display_name || 'Unknown';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title={displayName} />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchDependentData} />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: statusColors[dependent.status] }]}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileRole}>Dependent</Text>
            
            {/* Quick Actions */}
            {dependent.phone && (
              <View style={styles.quickActions}>
                <Button variant="primary" size="sm" style={styles.quickAction} onPress={handleCall}>
                  📞 Call
                </Button>
                <Button variant="secondary" size="sm" style={styles.quickAction} onPress={handleMessage}>
                  💬 Message
                </Button>
              </View>
            )}
          </View>

          {/* Status Card */}
          <Card style={styles.card}>
            <View style={styles.statusHeader}>
              <Text style={styles.cardTitle}>Current Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[dependent.status] }]}>
                <Text style={styles.statusBadgeText}>{statusLabels[dependent.status]}</Text>
              </View>
            </View>
            
            <View style={styles.statusInfo}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Last check-in</Text>
                <Text style={styles.statusValue}>
                  {dependent.lastCheckIn
                    ? new Date(dependent.lastCheckIn.checked_in_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not today'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Today's check-ins</Text>
                <Text style={styles.statusValue}>
                  {dependent.recentCheckIns.filter(c => {
                    const today = new Date();
                    const checkInDate = new Date(c.checked_in_at);
                    return checkInDate.toDateString() === today.toDateString();
                  }).length}
                </Text>
              </View>
            </View>
          </Card>

          {/* Recent History */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Recent Check-ins</Text>
            {dependent.recentCheckIns.length > 0 ? (
              dependent.recentCheckIns.slice(0, 5).map((checkIn) => {
                const checkInDate = new Date(checkIn.checked_in_at);
                const isToday = checkInDate.toDateString() === new Date().toDateString();
                const dateStr = isToday
                  ? 'Today'
                  : checkInDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                const timeStr = checkInDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <View key={checkIn.id} style={styles.historyItem}>
                    <View style={[styles.historyDot, { backgroundColor: Colors.light.primary }]} />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTime}>{dateStr}, {timeStr}</Text>
                      <Text style={styles.historyStatus}>
                        {checkIn.status === 'completed' ? 'Checked in' : checkIn.status}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No recent check-ins</Text>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
    minWidth: 80,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  avatarText: {
    ...Typography.display,
    color: Colors.light.surface,
  },
  profileName: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  profileRole: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickAction: {
    minWidth: 100,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.light.surface,
  },
  statusInfo: {
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  statusValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyTime: {
    ...Typography.bodySmall,
    color: Colors.light.text,
  },
  historyStatus: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  skeletonCard: {
    marginBottom: Spacing.md,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  skeletonSection: {
    marginTop: Spacing.md,
  },
  skeletonSectionTitle: {
    marginBottom: Spacing.md,
  },
});
