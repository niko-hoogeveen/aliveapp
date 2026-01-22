/**
 * Guardian Settings screen for the I'm Okay app.
 * Account settings, notification preferences, and app info.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants';
import { useAuthContext } from '@/providers';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ label, value, onPress, rightElement }: SettingRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {rightElement || (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && <Text style={styles.settingChevron}>›</Text>}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function GuardianSettingsScreen() {
  const { profile, user, signOut } = useAuthContext();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to sign out');
              setSigningOut(false);
            }
            // AuthProvider will handle navigation to login
          },
        },
      ]
    );
  };

  const displayName = profile?.display_name || 'Not set';
  const email = user?.email || 'Not available';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card padding="none">
            <SettingRow label="Name" value={displayName} onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Email" value={email} />
            <View style={styles.divider} />
            <SettingRow label="Role" value="Guardian" />
          </Card>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <Card padding="none">
            <SettingRow
              label="Current Plan"
              value="Free"
              onPress={() => router.push('/(shared)/subscription')}
            />
          </Card>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card padding="none">
            <SettingRow
              label="Push Notifications"
              rightElement={
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
                  thumbColor={pushEnabled ? Colors.light.primary : Colors.light.textDisabled}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              label="Sound"
              rightElement={
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
                  thumbColor={soundEnabled ? Colors.light.primary : Colors.light.textDisabled}
                />
              }
            />
          </Card>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Card padding="none">
            <SettingRow label="Version" value="1.0.0" />
            <View style={styles.divider} />
            <SettingRow label="Privacy Policy" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Terms of Service" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Contact Support" onPress={() => {}} />
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Button 
            variant="danger" 
            onPress={handleSignOut}
            loading={signingOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.light.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  settingChevron: {
    ...Typography.h2,
    color: Colors.light.textDisabled,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: Spacing.lg,
  },
});
