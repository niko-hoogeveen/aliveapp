/**
 * Join screen for the I'm Okay app.
 * Dependents enter an invite code to connect with a guardian.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants';

export default function DependentJoinScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // TODO: Validate invite code and create relationship in Supabase
      console.log('Joining with code:', code);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (e) {
      setError('Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>You're Connected!</Text>
          <Text style={styles.successText}>
            Your guardian has been notified. They'll confirm the connection shortly.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Your Guardian</Text>
            <Text style={styles.subtitle}>
              Enter the 6-character code your guardian shared with you.
            </Text>
          </View>

          {/* Code Input */}
          <Card style={styles.card}>
            <Input
              label="Invite Code"
              placeholder="Enter code"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              error={error || undefined}
              style={styles.codeInput}
            />

            <Button
              variant="primary"
              onPress={handleJoin}
              loading={loading}
              disabled={code.length !== 6}
            >
              Join
            </Button>
          </Card>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Don't have a code? Ask your family member who wants to be your guardian to send you an invite.
            </Text>
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
  card: {
    marginBottom: Spacing.lg,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  helpContainer: {
    paddingHorizontal: Spacing.lg,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
