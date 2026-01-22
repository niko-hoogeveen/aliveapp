/**
 * Input component for the I'm Okay app.
 * Text input with label, error states, and accessibility support.
 * Minimum touch target: 48pt height for accessibility.
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom input style */
  style?: TextStyle;
}

/**
 * A text input component following the design system.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   onChangeText={setEmail}
 *   value={email}
 *   keyboardType="email-address"
 *   autoCapitalize="none"
 * />
 * ```
 */
export function Input({
  label,
  error,
  helperText,
  containerStyle,
  style,
  editable = true,
  accessibilityLabel,
  ...props
}: InputProps) {
  const hasError = Boolean(error);
  const isDisabled = editable === false;

  const inputStyles: TextStyle[] = [
    styles.input,
    hasError && styles.inputError,
    isDisabled && styles.inputDisabled,
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label}
        </Text>
      )}
      <TextInput
        style={inputStyles}
        editable={editable}
        placeholderTextColor={Colors.light.textDisabled}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ disabled: isDisabled }}
        accessibilityHint={error || helperText}
        {...props}
      />
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },

  labelError: {
    color: Colors.light.danger,
  },

  input: {
    ...Typography.body,
    minHeight: 48, // Minimum touch target
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.light.text,
  },

  inputError: {
    borderColor: Colors.light.danger,
    borderWidth: 2,
  },

  inputDisabled: {
    backgroundColor: Colors.light.background,
    color: Colors.light.textDisabled,
  },

  helperText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },

  errorText: {
    color: Colors.light.danger,
  },
});

export default Input;
