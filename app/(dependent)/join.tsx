/**
 * Join Guardian Screen
 * 
 * Allows dependents to enter an invite code to connect with a guardian.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

export default function JoinGuardianScreen() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Use any type for Supabase to bypass strict typing issues
  const db = supabase as any;

  /**
   * Validate and join using invite code
   */
  const handleJoin = async () => {
    if (!user) {
      setError('Please log in to join a guardian');
      return;
    }

    const code = inviteCode.toUpperCase().trim();
    
    if (code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the relationship with this invite code
      const { data: relationship, error: findError } = await db
        .from('relationships')
        .select('*')
        .eq('invite_code', code)
        .eq('status', 'pending')
        .is('dependent_id', null)
        .single();

      if (findError || !relationship) {
        setError('Invalid or expired invite code');
        setLoading(false);
        return;
      }

      // Check if the user is already connected to this guardian
      const { data: existing } = await db
        .from('relationships')
        .select('*')
        .eq('guardian_id', relationship.guardian_id)
        .eq('dependent_id', user.id)
        .eq('status', 'active')
        .single();

      if (existing) {
        setError('You are already connected to this guardian');
        setLoading(false);
        return;
      }

      // Update the relationship with the dependent ID and activate it
      const { error: updateError } = await db
        .from('relationships')
        .update({
          dependent_id: user.id,
          status: 'active',
          invite_code: null, // Clear the invite code once used
        })
        .eq('id', relationship.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Navigate to home after a short delay
      setTimeout(() => {
        router.replace('/(dependent)');
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join guardian';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Connected!</Text>
          <Text style={styles.successText}>
            You've successfully connected with your guardian
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Join a Guardian</Text>
            <Text style={styles.subtitle}>
              Enter the invite code from your guardian to connect
            </Text>

            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Enter Invite Code</Text>
              
              <Input
                placeholder="ABC123"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text.toUpperCase());
                  setError(null);
                }}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
                inputStyle={styles.codeInput}
                error={error || undefined}
              />

              <Button
                onPress={handleJoin}
                loading={loading}
                disabled={loading || inviteCode.length !== 6}
                style={styles.joinButton}
              >
                Join Guardian
              </Button>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to get a code</Text>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Ask your guardian to open the I'm Okay app
                </Text>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  They'll tap "Add Dependent" to generate a code
                </Text>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Enter the 6-character code they share with you
                </Text>
              </View>
            </View>
          </View>
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
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  codeCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  codeLabel: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  joinButton: {
    marginTop: Spacing.md,
  },
  instructions: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  instructionsTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    ...Typography.button,
    color: Colors.light.primary,
  },
  stepText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
