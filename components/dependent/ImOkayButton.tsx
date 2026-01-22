/**
 * The main "I'm Okay" check-in button component.
 * Features animations and haptic feedback for a satisfying interaction.
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '@/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ImOkayButtonProps {
  onCheckIn: () => Promise<{ success: boolean; error?: string }>;
  hasCheckedInToday?: boolean;
  disabled?: boolean;
}

export function ImOkayButton({ onCheckIn, hasCheckedInToday, disabled }: ImOkayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const scale = useSharedValue(1);
  const successOpacity = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  const showSuccessFeedback = useCallback(() => {
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    successOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(2000, withTiming(0, { duration: 300 }))
    );

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  }, [successOpacity]);

  const handlePress = async () => {
    if (loading || disabled) return;

    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Press animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    setLoading(true);
    setError(null);

    try {
      const result = await onCheckIn();

      if (result.success) {
        runOnJS(showSuccessFeedback)();
      } else {
        setError(result.error || 'Check-in failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Check-in failed';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const buttonColor = hasCheckedInToday 
    ? Colors.light.primaryDark 
    : Colors.light.primary;

  return (
    <View style={styles.container}>
      <AnimatedTouchable
        style={[
          styles.button,
          { backgroundColor: buttonColor },
          buttonAnimatedStyle,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={loading || disabled}
        accessibilityRole="button"
        accessibilityLabel="I'm Okay - Press to check in"
        accessibilityHint="Sends a notification to your guardians that you are okay"
        accessibilityState={{ disabled: loading || disabled }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.surface} />
        ) : showSuccess ? (
          <Animated.View style={[styles.successContent, successAnimatedStyle]}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.successText}>Done!</Text>
          </Animated.View>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.heartIcon}>💚</Text>
            <Text style={styles.buttonText}>I'm Okay</Text>
            {hasCheckedInToday && (
              <Text style={styles.checkedText}>Checked in today</Text>
            )}
          </View>
        )}
      </AnimatedTouchable>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 256,
    height: 256,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  checkedText: {
    ...Typography.bodySmall,
    color: Colors.light.surface,
    opacity: 0.8,
    marginTop: Spacing.xs,
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
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.danger,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
