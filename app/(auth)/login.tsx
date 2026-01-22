/**
 * Login Screen
 * 
 * Email/password login for existing users.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError(null);
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
    }
    // Navigation is handled by the root layout based on auth state
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to I'm Okay</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error && !email ? 'Email is required' : undefined}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              error={error && !password ? 'Password is required' : undefined}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>
          </View>

          <Link href="/(auth)/signup" style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </Link>
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
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
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
  },
  form: {
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.md,
  },
  link: {
    alignSelf: 'center',
    padding: Spacing.md,
  },
  linkText: {
    ...Typography.body,
    color: Colors.light.primary,
  },
});
