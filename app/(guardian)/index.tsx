/**
 * Guardian Dashboard Screen
 * 
 * Overview of all dependents and their status.
 */

import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';
import { useDependents, DependentData } from '@/hooks/useDependents';
import { useAuth } from '@/hooks/useAuth';
import { useState, useCallback } from 'react';

type DependentStatus = 'ok' | 'pending' | 'missed' | 'unknown';

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
 * Format time since last check-in
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
 * Get status color
 */
function getStatusColor(status: DependentStatus): string {
  switch (status) {
    case 'ok': return Colors.light.primary;
    case 'pending': return Colors.light.warning;
    case 'missed': return Colors.light.danger;
    default: return Colors.light.textSecondary;
  }
}

export default function GuardianDashboardScreen() {
  const { profile } = useAuth();
  const { dependents, loading, error, refreshDependents, statusCounts } = useDependents();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshDependents();
    setRefreshing(false);
  }, [refreshDependents]);

  // Filter to only show active relationships
  const activeDependents = dependents.filter(
    d => d.relationship.status === 'active' && d.profile
  );

  // Get pending invites (relationships without a dependent yet)
  const pendingInvites = dependents.filter(
    d => d.relationship.status === 'pending' && !d.relationship.dependent_id
  );

  if (loading && dependents.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading dependents...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Guardian Dashboard</Text>
          <Text style={styles.subtitle}>
            {profile?.display_name 
              ? `Welcome, ${profile.display_name}` 
              : 'Monitor your loved ones'
            }
          </Text>
        </View>

        {/* Status Overview */}
        <View style={styles.statusOverview}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Status Overview</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: `${Colors.light.primary}20` }]}>
                  <Text style={styles.statusEmoji}>✓</Text>
                </View>
                <Text style={styles.statusCount}>{statusCounts.ok}</Text>
                <Text style={styles.statusLabel}>All Good</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: `${Colors.light.warning}20` }]}>
                  <Text style={styles.statusEmoji}>⏳</Text>
                </View>
                <Text style={styles.statusCount}>{statusCounts.pending}</Text>
                <Text style={styles.statusLabel}>Pending</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: `${Colors.light.danger}20` }]}>
                  <Text style={styles.statusEmoji}>!</Text>
                </View>
                <Text style={styles.statusCount}>{statusCounts.missed}</Text>
                <Text style={styles.statusLabel}>Missed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dependents List */}
        <View style={styles.dependentsList}>
          <Text style={styles.sectionTitle}>Your Circle</Text>
          
          {activeDependents.length === 0 && pendingInvites.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.emptyTitle}>No dependents yet</Text>
              <Text style={styles.emptyText}>
                Add a dependent to start receiving check-in updates
              </Text>
              <Pressable
                style={styles.addButton}
                onPress={() => router.push('/(guardian)/add-dependent')}
              >
                <Text style={styles.addButtonText}>+ Add Dependent</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {activeDependents.map((dependent) => (
                <Pressable
                  key={dependent.relationship.id}
                  style={styles.dependentCard}
                  onPress={() => router.push(`/(guardian)/${dependent.relationship.dependent_id}`)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(dependent.profile?.display_name)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(dependent.status) },
                      ]}
                    />
                  </View>
                  <View style={styles.dependentInfo}>
                    <Text style={styles.dependentName}>
                      {dependent.profile?.display_name || 'Unknown'}
                    </Text>
                    <Text style={styles.dependentLastCheckIn}>
                      Last: {formatTimeSince(dependent.lastCheckIn?.checked_in_at)}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}

              {/* Pending invites */}
              {pendingInvites.map((invite) => (
                <View key={invite.relationship.id} style={styles.pendingCard}>
                  <View style={[styles.avatar, styles.pendingAvatar]}>
                    <Text style={styles.pendingAvatarText}>?</Text>
                  </View>
                  <View style={styles.dependentInfo}>
                    <Text style={styles.dependentName}>Pending Invite</Text>
                    <Text style={styles.inviteCode}>
                      Code: {invite.relationship.invite_code}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Add Dependent Button (if there are already dependents) */}
        {(activeDependents.length > 0 || pendingInvites.length > 0) && (
          <View style={styles.addButtonContainer}>
            <Pressable
              style={styles.addButtonSecondary}
              onPress={() => router.push('/(guardian)/add-dependent')}
            >
              <Text style={styles.addButtonSecondaryText}>+ Add Another Dependent</Text>
            </Pressable>
          </View>
        )}
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
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
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
  statusOverview: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  statusTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusCount: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  dependentsList: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  dependentCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  pendingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pendingAvatar: {
    backgroundColor: `${Colors.light.textSecondary}20`,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.light.primary,
  },
  pendingAvatarText: {
    ...Typography.h3,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 2,
  },
  dependentLastCheckIn: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  inviteCode: {
    ...Typography.bodySmall,
    color: Colors.light.primary,
    fontFamily: 'monospace',
  },
  chevron: {
    ...Typography.h2,
    color: Colors.light.textSecondary,
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
    marginBottom: Spacing.lg,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  addButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  addButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  addButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonSecondaryText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
});
