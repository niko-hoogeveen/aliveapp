/**
 * Add Dependent screen for the I'm Okay app.
 * Generate invite code or send email invitation.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button, Card, Input } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AddDependentScreen() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGenerateCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const code = generateInviteCode();
    setInviteCode(code);
    // TODO: Save code to Supabase
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;

    try {
      await Share.share({
        message: `Join me on I'm Okay! Use this code to connect: ${inviteCode}\n\nDownload the app: https://imokay.app`,
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      // TODO: Send invite email via Supabase Edge Function
      console.log('Sending invite to:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
    } catch (e) {
      console.error('Failed to send email:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add a Dependent</Text>
          <Text style={styles.subtitle}>
            Generate a code or send an email invite to connect with someone.
          </Text>
        </View>

        {/* Code Section */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Share Invite Code</Text>
          
          {inviteCode ? (
            <View style={styles.codeContainer}>
              <TouchableOpacity
                style={styles.codeBox}
                onPress={handleShareCode}
                activeOpacity={0.8}
                accessibilityLabel={`Invite code: ${inviteCode}. Tap to share.`}
              >
                <Text style={styles.codeText}>{inviteCode}</Text>
              </TouchableOpacity>
              <Text style={styles.codeHint}>Tap to share</Text>
              
              <View style={styles.buttonRow}>
                <Button variant="secondary" onPress={handleShareCode} style={styles.flex1}>
                  📤 Share
                </Button>
                <Button variant="ghost" onPress={handleGenerateCode} style={styles.flex1}>
                  🔄 New Code
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.cardDescription}>
                Your dependent will enter this code in their app to connect with you.
              </Text>
              <Button variant="primary" onPress={handleGenerateCode}>
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
              />
              <Button
                variant="primary"
                onPress={handleSendEmail}
                loading={loading}
                disabled={!email.includes('@')}
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
    ...Typography.display,
    color: Colors.light.primary,
    letterSpacing: 8,
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
  helpContainer: {
    paddingHorizontal: Spacing.md,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
