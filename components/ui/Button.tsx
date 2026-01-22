/**
 * Button Component
 * 
 * A reusable button with Primary, Secondary, and Danger variants.
 * Follows the design system with proper accessibility support.
 */

import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { BorderRadius } from '@/constants/BorderRadius';
import { Shadows } from '@/constants/Shadows';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button text content */
  children: string;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled
              ? Colors.light.textDisabled
              : Colors.light.primary,
          },
          text: {
            color: Colors.light.surface,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled
              ? Colors.light.textDisabled
              : Colors.light.primary,
          },
          text: {
            color: isDisabled
              ? Colors.light.textDisabled
              : Colors.light.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled
              ? Colors.light.textDisabled
              : Colors.light.danger,
          },
          text: {
            color: Colors.light.surface,
          },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            minHeight: 36,
          },
          text: {
            fontSize: 14,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            minHeight: 48,
          },
          text: {
            fontSize: 16,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
            minHeight: 56,
          },
          text: {
            fontSize: 18,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={children}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    ...Typography.button,
  },
});
