/**
 * Dependent Home screen for the I'm Okay app.
 * Main "I'm Okay" button for daily check-ins.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '@/providers/AuthProvider';
import { useCheckins } from '@/hooks/useCheckins';
import { ImOkayButton } from '@/components/dependent/ImOkayButton';
import { Skeleton } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatLastCheckIn(lastCheckIn: { checked_in_at: string } | null): string {
  if (!lastCheckIn) return 'No check-in yet today';
  
  const checkInDate = new Date(lastCheckIn.checked_in_at);
  const today = new Date();
  
  const isToday = 
    checkInDate.getDate() === today.getDate() &&
    checkInDate.getMonth() === today.getMonth() &&
    checkInDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return `Last check-in: ${checkInDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return `Last check-in: ${checkInDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })} at ${checkInDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function DependentHomeScreen() {
  const { profile } = useAuthContext();
  const { 
    lastCheckIn, 
    hasCheckedInToday, 
    loading, 
    createCheckIn 
  } = useCheckins();

  const displayName = profile?.display_name || 'there';
  const greeting = `Good ${getTimeOfDay()}, ${displayName.split(' ')[0]}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Skeleton width={200} height={32} style={styles.skeletonGreeting} />
            <Skeleton width={250} height={18} />
          </View>

          {/* Button Skeleton */}
          <View style={styles.buttonContainer}>
            <Skeleton 
              width={200} 
              height={200} 
              borderRadius={100}
            />
          </View>

          {/* Status Skeleton */}
          <View style={styles.statusContainer}>
            <Skeleton width={160} height={16} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>
            {hasCheckedInToday 
              ? "You've checked in today. Great job!" 
              : "Let your family know you're okay"}
          </Text>
        </View>

        {/* Main Button */}
        <View style={styles.buttonContainer}>
          <ImOkayButton 
            onCheckIn={createCheckIn}
            hasCheckedInToday={hasCheckedInToday}
          />
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {formatLastCheckIn(lastCheckIn)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryLight,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
  },
  greeting: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  skeletonGreeting: {
    marginBottom: Spacing.sm,
  },
});
