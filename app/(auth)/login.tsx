/**
 * Login screen for the I'm Okay app.
 * Email/password authentication with Supabase.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button, Input, Card } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants';

export default function LoginScreen() {
  const { signIn, loading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading || authLoading;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError(null);
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
    // Navigation is handled by AuthProvider
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>I'm Okay</Text>
            <Text style={styles.subtitle}>Stay connected with your loved ones</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              variant="primary"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email || !password || isLoading}
              style={styles.loginButton}
            >
              Log In
            </Button>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Link>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.primary,
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
  loginButton: {
    marginTop: Spacing.sm,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  signupLink: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
