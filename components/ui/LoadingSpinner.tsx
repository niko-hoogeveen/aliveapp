/**
 * LoadingSpinner Component
 * 
 * A simple activity indicator wrapper with size variants.
 */

import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner color */
  color?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'md',
  color = Colors.light.primary,
  style,
}: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'md':
        return 'small';
      case 'lg':
        return 'large';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'sm':
        return { width: 24, height: 24 };
      case 'md':
        return { width: 40, height: 40 };
      case 'lg':
        return { width: 64, height: 64 };
    }
  };

  return (
    <View style={[styles.container, getContainerSize(), style]}>
      <ActivityIndicator size={getSize()} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
