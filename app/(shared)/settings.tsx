/**
 * Settings screen for the I'm Okay app.
 * Account settings, notification preferences, and app info.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

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

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // TODO: Get actual user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'guardian',
    subscription: 'Free',
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement sign out with Supabase
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card padding="none">
            <SettingRow label="Name" value={user.name} onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Email" value={user.email} />
            <View style={styles.divider} />
            <SettingRow label="Role" value={user.role === 'guardian' ? 'Guardian' : 'Dependent'} />
          </Card>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <Card padding="none">
            <SettingRow
              label="Current Plan"
              value={user.subscription}
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
          <Button variant="danger" onPress={handleSignOut}>
            Sign Out
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
  section: {
    marginTop: Spacing.lg,
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
