/**
 * Sign up screen for the I'm Okay app.
 * Registration with Supabase authentication.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button, Input, Card } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants';

export default function SignupScreen() {
  const { signUp, loading: authLoading } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading || authLoading;

  const handleSignup = async () => {
    setError(null);

    // Validation
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await signUp(email, password, displayName);

    if (!result.success) {
      setError(result.error || 'Failed to create account');
    }
    // Navigation to role-select is handled by AuthProvider
    
    setLoading(false);
  };

  const isFormValid = displayName && email && password && confirmPassword;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join I'm Okay to stay connected</Text>
          </View>

          {/* Signup Form */}
          <Card style={styles.card}>
            <Input
              label="Display Name"
              placeholder="How should we call you?"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              helperText="At least 8 characters"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              variant="primary"
              onPress={handleSignup}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              style={styles.signupButton}
            >
              Create Account
            </Button>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
  },
  card: {
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.danger,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  signupButton: {
    marginTop: Spacing.sm,
  },
});
