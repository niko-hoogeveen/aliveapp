/**
 * Card Component
 * 
 * A surface container with shadow and rounded corners.
 * Used for grouping related content.
 */

import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { BorderRadius } from '@/constants/BorderRadius';
import { Shadows } from '@/constants/Shadows';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  /** Card content */
  children: React.ReactNode;
  /** Padding size */
  padding?: CardPadding;
  /** Additional styles */
  style?: ViewStyle;
}

export function Card({
  children,
  padding = 'lg',
  style,
  ...props
}: CardProps) {
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: Spacing.sm };
      case 'md':
        return { padding: Spacing.md };
      case 'lg':
        return { padding: Spacing.lg };
    }
  };

  return (
    <View style={[styles.container, getPaddingStyle(), style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
});
