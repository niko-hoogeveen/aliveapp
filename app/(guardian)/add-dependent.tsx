/**
 * Add Dependent Screen
 * 
 * Generate an invite code for a new dependent to join.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

/**
 * Generate a random 6-character alphanumeric invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AddDependentScreen() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use any type for Supabase to bypass strict typing issues
  const db = supabase as any;

  /**
   * Create a new invite code
   */
  const createInviteCode = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const code = generateInviteCode();

      // Create relationship with invite code
      const { data, error: insertError } = await db
        .from('relationships')
        .insert({
          guardian_id: user.id,
          invite_code: code,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        // If code already exists, try again
        if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
          return createInviteCode();
        }
        throw insertError;
      }

      setInviteCode(code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate invite code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate invite code on mount
  useEffect(() => {
    createInviteCode();
  }, [user]);

  const handleShare = async () => {
    if (!inviteCode) return;

    try {
      await Share.share({
        message: `Join me on I'm Okay! Use invite code: ${inviteCode}\n\nDownload the app and enter this code to connect with me.`,
        title: "I'm Okay Invite",
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleGenerateNew = async () => {
    // Delete the old relationship if it exists
    if (inviteCode) {
      await db
        .from('relationships')
        .delete()
        .eq('guardian_id', user?.id)
        .eq('invite_code', inviteCode);
    }
    
    await createInviteCode();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Add Dependent</Text>
        <Text style={styles.subtitle}>
          Invite someone to join your circle
        </Text>

        {/* Invite Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Invite Code</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={createInviteCode}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.code}>{inviteCode}</Text>
              <Text style={styles.codeHint}>
                Share this code with your dependent so they can link their account
              </Text>
              
              <View style={styles.buttonGroup}>
                <Pressable style={styles.shareButton} onPress={handleShare}>
                  <Text style={styles.shareButtonText}>Share Code</Text>
                </Pressable>
                
                <Pressable style={styles.generateButton} onPress={handleGenerateNew}>
                  <Text style={styles.generateButtonText}>Generate New</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How it works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Share the invite code with your dependent
            </Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              They enter the code in their I'm Okay app
            </Text>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              You'll be notified when they link their account
            </Text>
          </View>
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  codeLabel: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.light.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  code: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 8,
    marginBottom: Spacing.sm,
  },
  codeHint: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  shareButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  generateButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.light.primary,
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
});
