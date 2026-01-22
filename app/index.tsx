/**
 * Root index - redirects based on auth state.
 * Navigation is handled by AuthProvider, this just shows loading.
 */

import { View, StyleSheet } from 'react-native';
import { LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants';

export default function Index() {
  // AuthProvider handles all navigation redirects
  // This screen shows briefly while auth state is being determined
  return (
    <View style={styles.container}>
      <LoadingSpinner centered size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
