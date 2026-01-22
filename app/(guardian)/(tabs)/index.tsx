/**
 * Guardian Dashboard screen for the I'm Okay app.
 * Overview of all dependents and their status.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDependents, DependentWithStatus } from '@/hooks/useDependents';
import { Card, Skeleton, SkeletonStatusCards, SkeletonListItem } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

type DependentStatus = 'ok' | 'pending' | 'missed';

interface StatusCount {
  ok: number;
  pending: number;
  missed: number;
}

function getDependentStatus(dependent: DependentWithStatus): DependentStatus {
  if (dependent.todayCheckIns.length > 0) {
    return 'ok';
  }
  // For now, consider all without check-ins as pending
  // Later we can use schedules to determine if they're actually missed
  return 'pending';
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.statusCard, { backgroundColor: color }]}>
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

function DependentCard({ dependent }: { dependent: DependentWithStatus }) {
  const status = getDependentStatus(dependent);
  
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

  const handlePress = () => {
    router.push(`/(guardian)/${dependent.id}`);
  };

  const displayName = dependent.display_name || 'Unknown';
  const lastCheckInTime = dependent.lastCheckIn
    ? new Date(dependent.lastCheckIn.checked_in_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, ${statusLabels[status]}`}
    >
      <Card style={styles.dependentCard}>
        <View style={styles.dependentHeader}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: statusColors[status] }]}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {/* Info */}
          <View style={styles.dependentInfo}>
            <Text style={styles.dependentName}>{displayName}</Text>
            <Text style={styles.dependentStatus}>
              {lastCheckInTime
                ? `Last check-in: ${lastCheckInTime}`
                : 'No check-in yet today'}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
            <Text style={styles.statusBadgeText}>{statusLabels[status]}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function GuardianDashboardScreen() {
  const { dependents, loading, error, refetch } = useDependents();

  // Calculate status counts
  const statusCounts: StatusCount = dependents.reduce(
    (acc, dep) => {
      const status = getDependentStatus(dep);
      acc[status]++;
      return acc;
    },
    { ok: 0, pending: 0, missed: 0 }
  );

  if (loading && dependents.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Skeleton width={150} height={32} style={styles.skeletonTitle} />
            <Skeleton width={120} height={18} />
          </View>

          {/* Status Cards Skeleton */}
          <SkeletonStatusCards />

          {/* Dependents List Skeleton */}
          <View style={styles.section}>
            <Skeleton width={100} height={20} style={styles.skeletonSectionTitle} />
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Circle</Text>
          <Text style={styles.subtitle}>
            {dependents.length} {dependents.length === 1 ? 'person' : 'people'} connected
          </Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Status Overview */}
        <View style={styles.statusOverview}>
          <StatusCard label="All Good" count={statusCounts.ok} color={Colors.light.primaryLight} />
          <StatusCard label="Pending" count={statusCounts.pending} color={Colors.light.accent + '40'} />
          <StatusCard label="Missed" count={statusCounts.missed} color={Colors.light.danger + '40'} />
        </View>

        {/* Dependents List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dependents</Text>
          {dependents.length > 0 ? (
            dependents.map((dependent) => (
              <DependentCard key={dependent.id} dependent={dependent} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No dependents yet. Add someone to get started.
              </Text>
            </Card>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
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
  errorCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.danger + '20',
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.danger,
    textAlign: 'center',
  },
  statusOverview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statusCount: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  dependentCard: {
    marginBottom: Spacing.sm,
  },
  dependentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.light.surface,
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dependentStatus: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
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
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  skeletonTitle: {
    marginBottom: Spacing.sm,
  },
  skeletonSectionTitle: {
    marginBottom: Spacing.md,
  },
});
