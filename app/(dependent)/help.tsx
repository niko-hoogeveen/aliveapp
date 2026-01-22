/**
 * Dependent Help Screen
 * 
 * Emergency contacts and help information.
 */

import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

export default function DependentHelpScreen() {
  const emergencyContacts = [
    { name: 'Emergency Services', phone: '911', relation: '911' },
    { name: 'Guardian', phone: '+1234567890', relation: 'Family' },
  ];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (phone: string) => {
    Linking.openURL(`sms:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>We're here if you need us</Text>
      </View>

      {/* Emergency Notice */}
      <View style={styles.emergencyNotice}>
        <Text style={styles.emergencyTitle}>Emergency?</Text>
        <Text style={styles.emergencyText}>
          In case of immediate danger or medical emergency, call 911 or your
          local emergency number.
        </Text>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
            </View>
            <View style={styles.contactActions}>
              <Pressable
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(contact.phone)}
              >
                <Text style={styles.actionButtonText}>Call</Text>
              </Pressable>
              {contact.phone !== '911' && (
                <Pressable
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={() => handleMessage(contact.phone)}
                >
                  <Text style={styles.actionButtonText}>Message</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryLight,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
  emergencyNotice: {
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(229, 115, 115, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(229, 115, 115, 0.3)',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  emergencyTitle: {
    ...Typography.h3,
    color: Colors.light.danger,
    marginBottom: Spacing.xs,
  },
  emergencyText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  contactsSection: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  contactInfo: {
    marginBottom: Spacing.md,
  },
  contactName: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  contactRelation: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  callButton: {
    backgroundColor: Colors.light.primary,
  },
  messageButton: {
    backgroundColor: Colors.light.accent,
  },
  actionButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
});
