/**
 * Role selection screen for the I'm Okay app.
 * Users choose between Guardian or Dependent role after signup.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

type Role = 'guardian' | 'dependent';

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

function RoleCard({ role, title, description, selected, onSelect }: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}: ${description}`}
    >
      <View style={styles.roleIcon}>
        <Text style={styles.roleEmoji}>
          {role === 'guardian' ? '👀' : '💚'}
        </Text>
      </View>
      <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
        {title}
      </Text>
      <Text style={styles.roleDescription}>{description}</Text>
      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);

    try {
      // TODO: Save role to user profile in Supabase
      console.log('Selected role:', selectedRole);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to appropriate screen based on role
      if (selectedRole === 'dependent') {
        router.replace('/(dependent)');
      } else {
        router.replace('/(guardian)');
      }
    } catch (e) {
      console.error('Error saving role:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>
            Choose your role to get started. You can change this later in settings.
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.rolesContainer} accessibilityRole="radiogroup">
          <RoleCard
            role="guardian"
            title="I'm a Guardian"
            description="I want to check on my loved ones and receive alerts when they need help."
            selected={selectedRole === 'guardian'}
            onSelect={() => setSelectedRole('guardian')}
          />

          <RoleCard
            role="dependent"
            title="I'm a Dependent"
            description="I want to let my family know I'm okay with a simple daily check-in."
            selected={selectedRole === 'dependent'}
            onSelect={() => setSelectedRole('dependent')}
          />
        </View>

        {/* Continue Button */}
        <Button
          variant="primary"
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedRole}
          style={styles.continueButton}
        >
          Continue
        </Button>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    gap: Spacing.md,
  },
  roleCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.md,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: Colors.light.primary,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleEmoji: {
    fontSize: 32,
  },
  roleTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  roleTitleSelected: {
    color: Colors.light.primary,
  },
  roleDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    marginVertical: Spacing.xl,
  },
});
