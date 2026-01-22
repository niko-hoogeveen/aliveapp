/**
 * ImOkayButton Component
 * 
 * The primary "I'm Okay" check-in button for dependents.
 * Features:
 * - Large circular button (256x256pt minimum)
 * - Press animation (scale down)
 * - Success pulse animation (expanding ring)
 * - Haptic feedback on success
 * - States: idle, pressing, loading, success
 */

import { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

const BUTTON_SIZE = 256;
const PULSE_RING_SIZE = BUTTON_SIZE + 40;

type ButtonState = 'idle' | 'pressing' | 'loading' | 'success';

interface ImOkayButtonProps {
  /** Callback when check-in is triggered */
  onCheckIn: () => Promise<void>;
  /** Last check-in timestamp */
  lastCheckIn?: Date | null;
  /** Loading state from parent */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function ImOkayButton({
  onCheckIn,
  lastCheckIn,
  loading = false,
  disabled = false,
}: ImOkayButtonProps) {
  // Animation values
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const successOpacity = useSharedValue(0);

  // Trigger haptic feedback
  const triggerSuccessHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Handle press in (finger down)
  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  // Handle press out (finger up)
  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Handle press (check-in)
  const handlePress = async () => {
    if (disabled || loading) return;
    
    try {
      await onCheckIn();
      // Animation handled by success effect
    } catch (error) {
      // Reset button on error
      scale.value = withSpring(1);
    }
  };

  // Play success animation when loading completes
  useEffect(() => {
    if (!loading && lastCheckIn) {
      // Show success state
      successOpacity.value = withTiming(1, { duration: 300 });
      
      // Trigger haptic
      runOnJS(triggerSuccessHaptic)();
      
      // Pulse animation
      pulseOpacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 600 })
      );
      pulseScale.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1.3, { duration: 700 })
      );

      // Reset success state after animation
      const timeout = setTimeout(() => {
        successOpacity.value = withTiming(0, { duration: 300 });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [loading, lastCheckIn]);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(successOpacity.value, [0, 1], [1, 0]),
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successOpacity.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <View style={styles.container}>
      {/* Pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />

      {/* Main button */}
      <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled}
          style={[
            styles.button,
            isDisabled && styles.buttonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Check in to confirm you're okay"
          accessibilityState={{ disabled: isDisabled }}
          accessibilityHint="Press to send a check-in notification to your guardians"
        >
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.surface} />
          ) : (
            <>
              {/* Idle content (heart icon) */}
              <Animated.View style={[styles.content, contentAnimatedStyle]}>
                <Text style={styles.heartIcon}>💚</Text>
                <Text style={styles.buttonText}>I'm Okay</Text>
              </Animated.View>

              {/* Success content (checkmark) */}
              <Animated.View style={[styles.content, styles.successContent, successAnimatedStyle]}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.successText}>Sent!</Text>
              </Animated.View>
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* Last check-in time */}
      {lastCheckIn && (
        <Text style={styles.lastCheckInText}>
          Last check-in: {formatTimeSince(lastCheckIn)}
        </Text>
      )}
    </View>
  );
}

/**
 * Format time since last check-in in human-readable format
 */
function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.textDisabled,
    shadowOpacity: 0.1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    position: 'absolute',
  },
  heartIcon: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  buttonText: {
    ...Typography.h2,
    color: Colors.light.surface,
  },
  checkIcon: {
    fontSize: 72,
    color: Colors.light.surface,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.h2,
    color: Colors.light.surface,
  },
  pulseRing: {
    position: 'absolute',
    width: PULSE_RING_SIZE,
    height: PULSE_RING_SIZE,
    borderRadius: PULSE_RING_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  lastCheckInText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
});
