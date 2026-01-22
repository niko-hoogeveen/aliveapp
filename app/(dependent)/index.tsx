/**
 * Dependent Home screen for the I'm Okay app.
 * Main "I'm Okay" button for daily check-ins.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function DependentHomeScreen() {
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCheckIn = async () => {
    if (loading) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Press animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    setLoading(true);

    try {
      // TODO: Submit check-in to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success!
      setLastCheckIn(new Date());
      setShowSuccess(true);
      
      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Hide success message after a delay
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error('Check-in failed:', e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastCheckIn = () => {
    if (!lastCheckIn) return 'No check-in yet today';
    
    return `Last check-in: ${lastCheckIn.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.subtitle}>Let your family know you're okay</Text>
        </View>

        {/* Main Button */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            style={[styles.okayButton, buttonAnimatedStyle]}
            onPress={handleCheckIn}
            activeOpacity={0.9}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="I'm Okay - Press to check in"
            accessibilityHint="Sends a notification to your guardians that you are okay"
          >
            {showSuccess ? (
              <View style={styles.successContent}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.successText}>Done!</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.heartIcon}>💚</Text>
                <Text style={styles.buttonText}>I'm Okay</Text>
              </View>
            )}
          </AnimatedTouchable>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{formatLastCheckIn()}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
  okayButton: {
    width: 256,
    height: 256,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  buttonContent: {
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  buttonText: {
    ...Typography.display,
    color: Colors.light.surface,
  },
  successContent: {
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 64,
    color: Colors.light.surface,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.h1,
    color: Colors.light.surface,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
