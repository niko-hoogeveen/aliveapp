/**
 * LoadingSpinner component for the I'm Okay app.
 * An activity indicator with customizable size and color.
 */

import React from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicatorProps,
} from 'react-native';
import { Colors } from '@/constants';

export type SpinnerSize = 'small' | 'large';

export interface LoadingSpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Custom color for the spinner */
  color?: string;
  /** Whether to center the spinner in its container */
  centered?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

/**
 * A loading indicator component following the design system.
 * 
 * @example
 * ```tsx
 * // Simple spinner
 * <LoadingSpinner />
 * 
 * // Centered in container
 * <LoadingSpinner centered size="large" />
 * 
 * // Custom color
 * <LoadingSpinner color={Colors.light.danger} />
 * ```
 */
export function LoadingSpinner({
  size = 'large',
  color = Colors.light.primary,
  centered = false,
  style,
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <ActivityIndicator
      size={size}
      color={color}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      {...props}
    />
  );

  if (centered) {
    return (
      <View style={[styles.centered, style]}>
        {spinner}
      </View>
    );
  }

  return spinner;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
