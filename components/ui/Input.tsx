/**
 * Input Component
 * 
 * A text input with label and error state support.
 * Minimum height of 48pt for accessibility.
 */

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { BorderRadius } from '@/constants/BorderRadius';

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Label text displayed above input */
  label?: string;
  /** Error message displayed below input */
  error?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional input text styles */
  inputStyle?: TextStyle;
}

export function Input({
  label,
  error,
  style,
  inputStyle,
  ...props
}: InputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={Colors.light.textDisabled}
        accessibilityLabel={label}
        accessibilityHint={error}
        {...props}
      />
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 48,
    ...Typography.body,
    color: Colors.light.text,
  },
  inputError: {
    borderColor: Colors.light.danger,
    borderWidth: 2,
  },
  error: {
    ...Typography.caption,
    color: Colors.light.danger,
    marginTop: Spacing.xs,
  },
});
