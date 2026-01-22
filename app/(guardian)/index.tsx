/**
 * Guardian Dashboard screen for the I'm Okay app.
 * Overview of all dependents and their status.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

interface StatusCount {
  ok: number;
  pending: number;
  missed: number;
}

interface Dependent {
  id: string;
  name: string;
  status: 'ok' | 'pending' | 'missed';
  lastCheckIn: Date | null;
  nextExpected: Date | null;
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.statusCard, { backgroundColor: color }]}>
      <Text style={styles.statusCount}>{count}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

function DependentCard({ dependent }: { dependent: Dependent }) {
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

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${dependent.name}, ${statusLabels[dependent.status]}`}
    >
      <Card style={styles.dependentCard}>
        <View style={styles.dependentHeader}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: statusColors[dependent.status] }]}>
            <Text style={styles.avatarText}>
              {dependent.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {/* Info */}
          <View style={styles.dependentInfo}>
            <Text style={styles.dependentName}>{dependent.name}</Text>
            <Text style={styles.dependentStatus}>
              {dependent.lastCheckIn
                ? `Last check-in: ${dependent.lastCheckIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'No check-in yet today'}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColors[dependent.status] }]}>
            <Text style={styles.statusBadgeText}>{statusLabels[dependent.status]}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function GuardianDashboardScreen() {
  // TODO: Fetch from Supabase
  const statusCounts: StatusCount = { ok: 1, pending: 0, missed: 0 };
  const dependents: Dependent[] = [
    {
      id: '1',
      name: 'Mom',
      status: 'ok',
      lastCheckIn: new Date(),
      nextExpected: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Circle</Text>
          <Text style={styles.subtitle}>
            {dependents.length} {dependents.length === 1 ? 'person' : 'people'} connected
          </Text>
        </View>

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
});
