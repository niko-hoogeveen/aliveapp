/**
 * Button component for the I'm Okay app.
 * Supports Primary, Secondary, and Danger variants.
 * Minimum touch target: 48x48pt for accessibility.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '@/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text content */
  children: React.ReactNode;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Custom text style overrides */
  textStyle?: TextStyle;
}

/**
 * A customizable button component following the design system.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handlePress}>
 *   Check In
 * </Button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`textSize_${size}`],
    styles[`textVariant_${variant}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? Colors.light.primary : Colors.light.surface}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  // Size variants - all meet 48pt minimum touch target
  size_sm: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  size_md: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  size_lg: {
    minHeight: 56,
    minWidth: 56,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },

  // Variant styles
  variant_primary: {
    backgroundColor: Colors.light.primary,
  },
  variant_secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  variant_danger: {
    backgroundColor: Colors.light.danger,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    ...Typography.button,
    textAlign: 'center',
  },
  textSize_sm: {
    fontSize: 14,
  },
  textSize_md: {
    fontSize: 16,
  },
  textSize_lg: {
    fontSize: 18,
  },

  // Text variant colors
  textVariant_primary: {
    color: Colors.light.surface,
  },
  textVariant_secondary: {
    color: Colors.light.primary,
  },
  textVariant_danger: {
    color: Colors.light.surface,
  },
  textVariant_ghost: {
    color: Colors.light.primary,
  },

  // Disabled text
  textDisabled: {
    color: Colors.light.textDisabled,
  },
});

export default Button;
