/**
 * StatusBadge Component
 * 
 * A small pill indicator showing check-in status.
 * Uses semantic colors: green for ok, orange for pending, red for missed.
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { BorderRadius } from '@/constants/BorderRadius';

type Status = 'ok' | 'pending' | 'missed';

interface StatusBadgeProps {
  /** The status to display */
  status: Status;
  /** Show text label */
  showLabel?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

export function StatusBadge({
  status,
  showLabel = true,
  style,
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ok':
        return {
          backgroundColor: `${Colors.light.primary}20`,
          color: Colors.light.primary,
          label: 'All Good',
          icon: '✓',
        };
      case 'pending':
        return {
          backgroundColor: `${Colors.light.warning}20`,
          color: Colors.light.warning,
          label: 'Pending',
          icon: '⏳',
        };
      case 'missed':
        return {
          backgroundColor: `${Colors.light.danger}20`,
          color: Colors.light.danger,
          label: 'Missed',
          icon: '!',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
      accessibilityLabel={`Status: ${config.label}`}
    >
      <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
