/**
 * Role Selection Screen
 * 
 * Users choose whether they're a Guardian or Dependent.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

export default function RoleSelectScreen() {
  const { updateProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'guardian' | 'dependent' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = async (role: 'guardian' | 'dependent') => {
    setSelectedRole(role);
    setError(null);

    const { error: updateError } = await updateProfile({ role });

    if (updateError) {
      setError(updateError.message);
      setSelectedRole(null);
      return;
    }

    // Navigate to the appropriate home screen
    if (role === 'guardian') {
      router.replace('/(guardian)');
    } else {
      router.replace('/(dependent)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>
          Choose your role to get started
        </Text>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.options}>
          <Pressable
            style={[
              styles.optionCard,
              selectedRole === 'guardian' && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectRole('guardian')}
            disabled={loading}
          >
            {loading && selectedRole === 'guardian' ? (
              <ActivityIndicator size="large" color={Colors.light.primary} />
            ) : (
              <>
                <Text style={styles.optionEmoji}>👨‍👩‍👧</Text>
                <Text style={styles.optionTitle}>Guardian</Text>
                <Text style={styles.optionDescription}>
                  I want to check on my loved ones
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.optionCard,
              selectedRole === 'dependent' && styles.optionCardSelected,
            ]}
            onPress={() => handleSelectRole('dependent')}
            disabled={loading}
          >
            {loading && selectedRole === 'dependent' ? (
              <ActivityIndicator size="large" color={Colors.light.primary} />
            ) : (
              <>
                <Text style={styles.optionEmoji}>💚</Text>
                <Text style={styles.optionTitle}>Dependent</Text>
                <Text style={styles.optionDescription}>
                  I want to let others know I'm okay
                </Text>
              </>
            )}
          </Pressable>
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
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  options: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    ...Shadows.md,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  optionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
