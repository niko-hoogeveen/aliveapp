/**
 * Dependent Detail Screen
 * 
 * View details and check-in history for a specific dependent.
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCheckins } from '@/hooks/useCheckins';
import { Database } from '@/types/database';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Checkin = Database['public']['Tables']['checkins']['Row'];

/**
 * Get initials from a name
 */
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format time since a date
 */
function formatTimeSince(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';
  
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
 * Format a date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format time for display
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

/**
 * Calculate status from last check-in
 */
function calculateStatus(lastCheckIn: Checkin | null): 'ok' | 'pending' | 'missed' | 'unknown' {
  if (!lastCheckIn) return 'unknown';
  if (lastCheckIn.status === 'missed' || lastCheckIn.status === 'help_requested') return 'missed';
  
  const checkInTime = new Date(lastCheckIn.checked_in_at);
  const now = new Date();
  const hoursSince = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 24) return 'ok';
  if (hoursSince < 48) return 'pending';
  return 'missed';
}

export default function DependentDetailScreen() {
  const { dependentId } = useLocalSearchParams<{ dependentId: string }>();
  const { user } = useAuth();
  const { getCheckInHistory, subscribeToCheckIns } = useCheckins();
  
  const [dependent, setDependent] = useState<Profile | null>(null);
  const [checkIns, setCheckIns] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = supabase as any;

  /**
   * Fetch dependent data and check-in history
   */
  const fetchData = useCallback(async () => {
    if (!dependentId || !user) return;

    setError(null);

    try {
      // Fetch dependent profile
      const { data: profileData, error: profileError } = await db
        .from('profiles')
        .select('*')
        .eq('id', dependentId)
        .single();

      if (profileError) throw profileError;
      setDependent(profileData);

      // Fetch check-in history
      const { data: checkInsData } = await getCheckInHistory(dependentId, 14);
      setCheckIns(checkInsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dependentId, user, db, getCheckInHistory]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time check-in updates
  useEffect(() => {
    if (!dependentId) return;

    const unsubscribe = subscribeToCheckIns((newCheckIn) => {
      setCheckIns(prev => [newCheckIn, ...prev].slice(0, 14));
    }, dependentId);

    return unsubscribe;
  }, [dependentId, subscribeToCheckIns]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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

  const lastCheckIn = checkIns[0] || null;
  const status = calculateStatus(lastCheckIn);

  const getStatusColor = () => {
    switch (status) {
      case 'ok': return Colors.light.primary;
      case 'pending': return Colors.light.warning;
      case 'missed': return Colors.light.danger;
      default: return Colors.light.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'ok': return 'All Good';
      case 'pending': return 'Pending';
      case 'missed': return 'Missed';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !dependent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Dependent not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          {/* Profile */}
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(dependent.display_name)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]} />
            </View>
            <Text style={styles.name}>{dependent.display_name || 'Unknown'}</Text>
            <Text style={styles.relationship}>{dependent.phone || 'No phone number'}</Text>
          </View>

          {/* Action Buttons */}
          {dependent.phone && (
            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton} onPress={handleCall}>
                <Text style={styles.actionButtonText}>📞 Call</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleMessage}>
                <Text style={styles.actionButtonText}>💬 Message</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Status Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Status</Text>
              <View style={[styles.statusPill, { backgroundColor: `${getStatusColor()}20` }]}>
                <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
                  {getStatusLabel()}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Check-in</Text>
              <Text style={styles.statusValue}>
                {lastCheckIn ? formatTimeSince(lastCheckIn.checked_in_at) : 'Never'}
              </Text>
            </View>
          </View>
        </View>

        {/* Check-in History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Check-ins</Text>
          <View style={styles.card}>
            {checkIns.length === 0 ? (
              <Text style={styles.emptyText}>No check-ins yet</Text>
            ) : (
              checkIns.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyItem,
                    index !== checkIns.length - 1 && styles.historyItemBorder,
                  ]}
                >
                  <View style={styles.historyIcon}>
                    {item.status === 'completed' ? (
                      <View style={styles.completedIcon}>
                        <Text style={styles.completedIconText}>✓</Text>
                      </View>
                    ) : item.status === 'help_requested' ? (
                      <View style={styles.helpIcon}>
                        <Text style={styles.helpIconText}>!</Text>
                      </View>
                    ) : (
                      <View style={styles.missedIcon}>
                        <Text style={styles.missedIconText}>×</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{formatDate(item.checked_in_at)}</Text>
                    <Text style={styles.historyTime}>{formatTime(item.checked_in_at)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.historyStatus,
                      item.status === 'missed' && styles.historyStatusMissed,
                      item.status === 'help_requested' && styles.historyStatusHelp,
                    ]}
                  >
                    {item.status === 'completed' ? 'Completed' : 
                     item.status === 'help_requested' ? 'Help Requested' : 'Missed'}
                  </Text>
                </View>
              ))
            )}
          </View>
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
  },
  header: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
  profile: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.light.primary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },
  name: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  relationship: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  actionButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  statusPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  statusPillText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  statusValue: {
    ...Typography.body,
    color: Colors.light.text,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyIcon: {
    marginRight: Spacing.md,
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIconText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  missedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.danger}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedIconText: {
    color: Colors.light.danger,
    fontWeight: '600',
    fontSize: 16,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIconText: {
    color: Colors.light.warning,
    fontWeight: '700',
    fontSize: 18,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    ...Typography.body,
    color: Colors.light.text,
    marginBottom: 2,
  },
  historyTime: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  historyStatus: {
    ...Typography.caption,
    color: Colors.light.primary,
  },
  historyStatusMissed: {
    color: Colors.light.danger,
  },
  historyStatusHelp: {
    color: Colors.light.warning,
  },
});
