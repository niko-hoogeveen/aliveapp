/**
 * Dependent Home Screen
 * 
 * The main "I'm Okay" check-in button screen.
 */

import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { ImOkayButton } from '@/components/dependent';
import { useCheckins } from '@/hooks/useCheckins';
import { useAuth } from '@/hooks/useAuth';

export default function DependentHomeScreen() {
  const { profile } = useAuth();
  const { createCheckIn, lastCheckIn, loading, subscribeToCheckIns } = useCheckins();

  // Subscribe to real-time check-in updates
  useEffect(() => {
    const unsubscribe = subscribeToCheckIns((newCheckin) => {
      console.log('New check-in received:', newCheckin);
    });

    return unsubscribe;
  }, [subscribeToCheckIns]);

  const handleCheckIn = useCallback(async () => {
    const { error } = await createCheckIn();
    if (error) {
      console.error('Check-in failed:', error);
    }
  }, [createCheckIn]);

  // Convert lastCheckIn timestamp to Date if available
  const lastCheckInDate = lastCheckIn?.checked_in_at 
    ? new Date(lastCheckIn.checked_in_at) 
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>I'm Okay</Text>
        <Text style={styles.subtitle}>
          {profile?.display_name 
            ? `Hi, ${profile.display_name}!` 
            : 'Let your guardians know you\'re well'
          }
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ImOkayButton
          onCheckIn={handleCheckIn}
          lastCheckIn={lastCheckInDate}
          loading={loading}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Tap the button to let your guardians know you're doing well
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
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  title: {
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
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: Spacing.md,
    borderRadius: 16,
  },
  infoText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
