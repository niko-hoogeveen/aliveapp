/**
 * Skeleton loading component for the I'm Okay app.
 * Shows placeholder content while data is loading.
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Base skeleton component with shimmer animation.
 */
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton for a card with title and content.
 */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={20} style={styles.mb} />
      <Skeleton width="100%" height={14} style={styles.mbSm} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}

/**
 * Skeleton for a list item with avatar.
 */
export function SkeletonListItem({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton 
        width={48} 
        height={48} 
        borderRadius={BorderRadius.full} 
      />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} style={styles.mbSm} />
        <Skeleton width="50%" height={12} />
      </View>
      <Skeleton width={60} height={24} borderRadius={BorderRadius.full} />
    </View>
  );
}

/**
 * Skeleton for status cards row.
 */
export function SkeletonStatusCards() {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusCard}>
        <Skeleton width={40} height={32} style={styles.mbSm} />
        <Skeleton width={60} height={12} />
      </View>
      <View style={styles.statusCard}>
        <Skeleton width={40} height={32} style={styles.mbSm} />
        <Skeleton width={60} height={12} />
      </View>
      <View style={styles.statusCard}>
        <Skeleton width={40} height={32} style={styles.mbSm} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton for profile header.
 */
export function SkeletonProfileHeader() {
  return (
    <View style={styles.profileHeader}>
      <Skeleton 
        width={96} 
        height={96} 
        borderRadius={BorderRadius.full}
        style={styles.mb}
      />
      <Skeleton width={150} height={24} style={styles.mbSm} />
      <Skeleton width={80} height={14} />
    </View>
  );
}

/**
 * Skeleton for the dependent home screen.
 */
export function SkeletonDependentHome() {
  return (
    <View style={styles.dependentHome}>
      <Skeleton width="60%" height={28} style={styles.mbSm} />
      <Skeleton width="40%" height={16} style={styles.mb} />
      <Skeleton 
        width={200} 
        height={200} 
        borderRadius={100}
        style={styles.centerSelf}
      />
      <Skeleton width="50%" height={14} style={[styles.mt, styles.centerSelf]} />
    </View>
  );
}

/**
 * Skeleton for alerts list.
 */
export function SkeletonAlertItem({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.alertItem, style]}>
      <View style={styles.alertHeader}>
        <Skeleton width={32} height={32} borderRadius={BorderRadius.full} />
        <View style={styles.alertHeaderText}>
          <Skeleton width="60%" height={16} style={styles.mbSm} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="90%" height={14} style={styles.mt} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.light.border,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  dependentHome: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  alertItem: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertHeaderText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mb: {
    marginBottom: Spacing.md,
  },
  mbSm: {
    marginBottom: Spacing.sm,
  },
  mt: {
    marginTop: Spacing.md,
  },
  centerSelf: {
    alignSelf: 'center',
  },
});
