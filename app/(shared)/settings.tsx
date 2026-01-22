/**
 * Settings Screen
 * 
 * Account settings and preferences.
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

export default function SettingsScreen() {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Information', icon: '👤' },
        { label: 'Subscription', icon: '💎', onPress: () => router.push('/(shared)/subscription') },
        { label: 'Privacy & Security', icon: '🔒' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Alert Preferences', icon: '🔔' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: '❓' },
        { label: 'Terms & Privacy', icon: '📄' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@email.com</Text>
            </View>
            <Pressable style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={[
                    styles.settingsItem,
                    itemIndex !== section.items.length - 1 && styles.settingsItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingsItemIcon}>
                    <Text style={styles.settingsItemIconText}>{item.icon}</Text>
                  </View>
                  <Text style={styles.settingsItemLabel}>{item.label}</Text>
                  <Text style={styles.settingsItemChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={styles.section}>
          <Pressable style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>I'm Okay</Text>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  profileSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.light.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.light.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 2,
  },
  profileEmail: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  editButton: {
    minHeight: 40,
    justifyContent: 'center',
  },
  editButtonText: {
    ...Typography.button,
    color: Colors.light.accent,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    ...Shadows.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    minHeight: 64,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingsItemIconText: {
    fontSize: 18,
  },
  settingsItemLabel: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
  },
  settingsItemChevron: {
    ...Typography.h2,
    color: Colors.light.textSecondary,
  },
  signOutButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  signOutText: {
    ...Typography.button,
    color: Colors.light.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
});
