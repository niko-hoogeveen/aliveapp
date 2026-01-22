/**
 * Dependent Detail screen for the I'm Okay app.
 * View detailed information about a specific dependent.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

export default function DependentDetailScreen() {
  const { dependentId } = useLocalSearchParams<{ dependentId: string }>();

  // TODO: Fetch dependent data from Supabase
  const dependent: {
    id: string | undefined;
    name: string;
    status: 'ok' | 'pending' | 'missed';
    relationship: string;
    phone: string;
    lastCheckIn: Date | null;
    nextExpected: Date | null;
  } = {
    id: dependentId,
    name: 'Mom',
    status: 'ok',
    relationship: 'Parent',
    phone: '+1234567890',
    lastCheckIn: new Date(),
    nextExpected: null,
  };

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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: dependent.name,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: Colors.light.background },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: statusColors[dependent.status] }]}>
              <Text style={styles.avatarText}>
                {dependent.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{dependent.name}</Text>
            <Text style={styles.profileRelationship}>{dependent.relationship}</Text>
            
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Button variant="primary" size="sm" style={styles.quickAction}>
                📞 Call
              </Button>
              <Button variant="secondary" size="sm" style={styles.quickAction}>
                💬 Message
              </Button>
            </View>
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
                    ? dependent.lastCheckIn.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Next expected</Text>
                <Text style={styles.statusValue}>
                  {dependent.nextExpected
                    ? dependent.nextExpected.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not scheduled'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Schedule Card */}
          <Card style={styles.card}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.cardTitle}>Check-in Schedule</Text>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </View>
            <Text style={styles.scheduleText}>
              Daily from 9:00 AM to 10:00 AM
            </Text>
            <Text style={styles.scheduleSubtext}>
              Reminder 15 minutes before deadline
            </Text>
          </Card>

          {/* Recent History */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Recent Check-ins</Text>
            <View style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: Colors.light.primary }]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyTime}>Today, 9:23 AM</Text>
                <Text style={styles.historyStatus}>Checked in</Text>
              </View>
            </View>
            <View style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: Colors.light.primary }]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyTime}>Yesterday, 9:15 AM</Text>
                <Text style={styles.historyStatus}>Checked in</Text>
              </View>
            </View>
            <Button variant="ghost" style={styles.viewAllButton}>
              View All History
            </Button>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
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
  profileRelationship: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scheduleText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  scheduleSubtext: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
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
  viewAllButton: {
    marginTop: Spacing.sm,
  },
});
