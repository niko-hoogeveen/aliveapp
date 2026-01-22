/**
 * Join screen for the I'm Okay app.
 * Dependents enter an invite code to connect with a guardian.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRelationships } from '@/hooks/useRelationships';
import { Button, Input, Card } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants';

export default function DependentJoinScreen() {
  const { joinWithCode, loading: hookLoading } = useRelationships();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [guardianName, setGuardianName] = useState<string | null>(null);

  const isLoading = loading || hookLoading;

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setError(null);
    setLoading(true);

    const result = await joinWithCode(code);

    if (result.success) {
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back to home after a delay
      setTimeout(() => {
        router.replace('/(dependent)');
      }, 2000);
    } else {
      setError(result.error || 'Invalid code. Please check and try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setLoading(false);
  };

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setCode(cleaned);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>You're Connected!</Text>
          <Text style={styles.successText}>
            {guardianName 
              ? `You've connected with ${guardianName}. They can now see your check-ins.`
              : "Your guardian has been notified. They can now see your check-ins."}
          </Text>
          <Button 
            variant="primary" 
            onPress={() => router.replace('/(dependent)')}
            style={styles.homeButton}
          >
            Go to Home
          </Button>
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
              placeholder="ABCD12"
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              error={error || undefined}
              editable={!isLoading}
              style={styles.codeInput}
            />

            <Button
              variant="primary"
              onPress={handleJoin}
              loading={isLoading}
              disabled={code.length !== 6 || isLoading}
            >
              Join
            </Button>
          </Card>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Don't have a code?</Text>
            <Text style={styles.helpText}>
              Ask your family member who wants to be your guardian to send you an invite from their app.
            </Text>
          </View>

          {/* How it works */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>1</Text>
              <Text style={styles.infoText}>Your guardian generates a code in their app</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>2</Text>
              <Text style={styles.infoText}>They share the code with you</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>3</Text>
              <Text style={styles.infoText}>Enter the code above to connect</Text>
            </View>
          </Card>
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
    marginBottom: Spacing.lg,
  },
  helpTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.light.primaryLight,
  },
  infoTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    color: Colors.light.surface,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    marginRight: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
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
    marginBottom: Spacing.xl,
  },
  homeButton: {
    minWidth: 200,
  },
});
