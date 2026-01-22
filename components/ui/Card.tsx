/**
 * Card component for the I'm Okay app.
 * A surface container with shadow and rounded corners.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants';

export interface CardProps extends ViewProps {
  /** Card content */
  children: React.ReactNode;
  /** Custom padding value or use 'none' to remove padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/**
 * A card container component following the design system.
 * 
 * @example
 * ```tsx
 * <Card padding="lg">
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */
export function Card({
  children,
  padding = 'lg',
  style,
  ...props
}: CardProps) {
  const containerStyles: ViewStyle[] = [
    styles.container,
    padding !== 'none' && styles[`padding_${padding}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={containerStyles} {...props}>
      {children}
    </View>
  );
}

/**
 * Card Header component for consistent header styling.
 */
export function CardHeader({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Card Content component for the main content area.
 */
export function CardContent({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Card Footer component for actions or additional info.
 */
export function CardFooter({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.footer, style]} {...props}>
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

  // Padding variants
  padding_sm: {
    padding: Spacing.sm,
  },
  padding_md: {
    padding: Spacing.md,
  },
  padding_lg: {
    padding: Spacing.lg,
  },

  // Sub-components
  header: {
    marginBottom: Spacing.md,
  },
  content: {
    // Content takes available space
  },
  footer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Card;
