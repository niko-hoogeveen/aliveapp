/**
 * 404 Not Found Screen
 */

import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go Home</Text>
        </Link>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  link: {
    padding: Spacing.md,
  },
  linkText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
});
