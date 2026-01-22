/**
 * Avatar Component
 * 
 * Displays user initials with an optional status badge.
 * Used for representing users throughout the app.
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarStatus = 'ok' | 'pending' | 'missed' | undefined;

interface AvatarProps {
  /** User initials (1-2 characters) */
  initials: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Status indicator */
  status?: AvatarStatus;
  /** Additional styles */
  style?: ViewStyle;
}

export function Avatar({
  initials,
  size = 'md',
  status,
  style,
}: AvatarProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { width: 40, height: 40, borderRadius: 20 },
          text: { fontSize: 14 },
          badge: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
        };
      case 'md':
        return {
          container: { width: 56, height: 56, borderRadius: 28 },
          text: { fontSize: 18 },
          badge: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
        };
      case 'lg':
        return {
          container: { width: 80, height: 80, borderRadius: 40 },
          text: { fontSize: 24 },
          badge: { width: 24, height: 24, borderRadius: 12, borderWidth: 3 },
        };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ok':
        return Colors.light.primary;
      case 'pending':
        return Colors.light.warning;
      case 'missed':
        return Colors.light.danger;
      default:
        return 'transparent';
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      <Text style={[styles.initials, { fontSize: sizeStyles.text.fontSize }]}>
        {initials.toUpperCase().slice(0, 2)}
      </Text>
      
      {status && (
        <View
          style={[
            styles.statusBadge,
            sizeStyles.badge,
            { backgroundColor: getStatusColor() },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  initials: {
    ...Typography.h3,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderColor: Colors.light.surface,
  },
});
