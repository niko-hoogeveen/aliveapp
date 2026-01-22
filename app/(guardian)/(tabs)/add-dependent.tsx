/**
 * Add Dependent screen for the I'm Okay app.
 * Generate invite code or send email invitation.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRelationships } from '@/hooks/useRelationships';
import { Button, Card, Input, Skeleton, SkeletonCard } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

export default function AddDependentScreen() {
  const { pendingInvites, createInvite, loading: hookLoading } = useRelationships();
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Track when initial load completes
  if (!initialLoadDone && !hookLoading) {
    setInitialLoadDone(true);
  }

  // Prioritize newly created code, then fall back to pending invite from DB
  // This ensures the UI shows the new code immediately after creation
  const existingCode = currentCode || pendingInvites[0]?.invite_code;

  const handleGenerateCode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError(null);
    
    const result = await createInvite();
    
    if (result.success && result.inviteCode) {
      setCurrentCode(result.inviteCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || 'Failed to generate code');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleShareCode = async () => {
    const codeToShare = existingCode;
    if (!codeToShare) return;

    try {
      await Share.share({
        message: `Join me on I'm Okay! Use this code to connect: ${codeToShare}\n\nDownload the app: https://imokay.app`,
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleCopyCode = async () => {
    const codeToCopy = existingCode;
    if (!codeToCopy) return;

    // In a real app, use Clipboard.setStringAsync
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For now just share
    handleShareCode();
  };

  const handleSendEmail = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);
    
    try {
      // First generate a code if we don't have one
      let codeToSend = existingCode;
      if (!codeToSend) {
        const result = await createInvite();
        if (!result.success || !result.inviteCode) {
          setError(result.error || 'Failed to generate invite code');
          setLoading(false);
          return;
        }
        codeToSend = result.inviteCode;
        setCurrentCode(codeToSend);
      }

      // TODO: Send invite email via Supabase Edge Function
      console.log('Sending invite to:', email, 'with code:', codeToSend);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError('Failed to send email. Please try again.');
      console.error('Failed to send email:', e);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || hookLoading;

  // Show skeleton on initial load
  if (!initialLoadDone && hookLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Skeleton width={200} height={32} style={styles.skeletonTitle} />
            <Skeleton width={280} height={18} />
          </View>

          {/* Code Card Skeleton */}
          <Card style={styles.card}>
            <Skeleton width={140} height={20} style={styles.skeletonCardTitle} />
            <View style={styles.skeletonCodeContainer}>
              <Skeleton 
                width={200} 
                height={64} 
                borderRadius={BorderRadius.lg} 
                style={styles.skeletonCodeBox}
              />
              <Skeleton width={80} height={14} style={styles.skeletonCodeHint} />
              <View style={styles.buttonRow}>
                <Skeleton width="48%" height={44} borderRadius={BorderRadius.md} />
                <Skeleton width="48%" height={44} borderRadius={BorderRadius.md} />
              </View>
            </View>
          </Card>

          {/* Email Card Skeleton */}
          <Card style={styles.card}>
            <Skeleton width={140} height={20} style={styles.skeletonCardTitle} />
            <Skeleton width="100%" height={14} style={styles.skeletonDescription} />
            <Skeleton width="100%" height={14} style={styles.skeletonDescription} />
            <Skeleton width="100%" height={48} borderRadius={BorderRadius.md} style={styles.skeletonInput} />
            <Skeleton width="100%" height={48} borderRadius={BorderRadius.md} />
          </Card>

          {/* Help Text Skeleton */}
          <View style={styles.helpContainer}>
            <Skeleton width="80%" height={14} style={styles.skeletonHelp} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add a Dependent</Text>
          <Text style={styles.subtitle}>
            Generate a code or send an email invite to connect with someone.
          </Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Code Section */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Share Invite Code</Text>
          
          {existingCode ? (
            <View style={styles.codeContainer}>
              <TouchableOpacity
                style={styles.codeBox}
                onPress={handleCopyCode}
                activeOpacity={0.8}
                accessibilityLabel={`Invite code: ${existingCode}. Tap to share.`}
              >
                <Text style={styles.codeText}>{existingCode}</Text>
              </TouchableOpacity>
              <Text style={styles.codeHint}>Tap to share</Text>
              
              <View style={styles.buttonRow}>
                <Button 
                  variant="secondary" 
                  onPress={handleShareCode} 
                  style={styles.flex1}
                  disabled={isLoading}
                >
                  📤 Share
                </Button>
                <Button 
                  variant="ghost" 
                  onPress={handleGenerateCode} 
                  style={styles.flex1}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  🔄 New Code
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.cardDescription}>
                Your dependent will enter this code in their app to connect with you.
              </Text>
              <Button 
                variant="primary" 
                onPress={handleGenerateCode}
                loading={isLoading}
                disabled={isLoading}
              >
                Generate Code
              </Button>
            </View>
          )}
        </Card>

        {/* Email Section */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Send Email Invite</Text>
          
          {emailSent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✉️</Text>
              <Text style={styles.successText}>
                Invite sent to {email}
              </Text>
              <Button
                variant="ghost"
                onPress={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Send Another
              </Button>
            </View>
          ) : (
            <View>
              <Text style={styles.cardDescription}>
                We'll send them instructions on how to download and set up the app.
              </Text>
              <Input
                label="Email Address"
                placeholder="Enter their email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
              <Button
                variant="primary"
                onPress={handleSendEmail}
                loading={isLoading}
                disabled={!email.includes('@') || isLoading}
              >
                Send Invite
              </Button>
            </View>
          )}
        </Card>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 After your dependent joins, you'll see them on your dashboard once they complete setup.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  errorCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.danger + '20',
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.danger,
    textAlign: 'center',
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeBox: {
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  codeText: {
    ...Typography.invitecode,
    color: Colors.light.primary,
    letterSpacing: 7,
  },
  codeHint: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  flex1: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.body,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pendingInvite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  pendingCode: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 2,
  },
  pendingDate: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  helpContainer: {
    paddingHorizontal: Spacing.md,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  skeletonTitle: {
    marginBottom: Spacing.sm,
  },
  skeletonCardTitle: {
    marginBottom: Spacing.md,
  },
  skeletonCodeContainer: {
    alignItems: 'center',
  },
  skeletonCodeBox: {
    marginBottom: Spacing.sm,
  },
  skeletonCodeHint: {
    marginBottom: Spacing.md,
  },
  skeletonDescription: {
    marginBottom: Spacing.sm,
  },
  skeletonInput: {
    marginBottom: Spacing.md,
  },
  skeletonHelp: {
    alignSelf: 'center',
  },
});
