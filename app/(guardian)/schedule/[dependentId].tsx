/**
 * Schedule Configuration Screen
 * 
 * Configure check-in schedule for a dependent.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function ScheduleScreen() {
  const { dependentId } = useLocalSearchParams<{ dependentId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Schedule Configuration</Text>
        <Text style={styles.subtitle}>
          Configure check-in schedule for dependent {dependentId}
        </Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Schedule editor placeholder - will be implemented in Phase 2
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xl,
  },
  placeholder: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
