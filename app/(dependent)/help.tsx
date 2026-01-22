/**
 * Dependent Help screen for the I'm Okay app.
 * Emergency contacts and quick help options.
 */

import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

interface ContactProps {
  name: string;
  phone: string;
  relationship: string;
}

function ContactCard({ name, phone, relationship }: ContactProps) {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${phone}`);
  };

  return (
    <Card style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.contactRelationship}>{relationship}</Text>
      </View>
      <View style={styles.contactActions}>
        <Button
          variant="primary"
          size="sm"
          onPress={handleCall}
          style={styles.actionButton}
          accessibilityLabel={`Call ${name}`}
        >
          📞 Call
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPress={handleMessage}
          style={styles.actionButton}
          accessibilityLabel={`Message ${name}`}
        >
          💬 Message
        </Button>
      </View>
    </Card>
  );
}

export default function DependentHelpScreen() {
  // TODO: Fetch contacts from Supabase relationships
  const contacts: ContactProps[] = [
    { name: 'John Smith', phone: '+1234567890', relationship: 'Guardian' },
  ];

  const handleEmergencyCall = () => {
    Alert.alert(
      'Call Emergency Services?',
      'This will dial 911. Only use in case of emergency.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Emergency Banner */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyTitle}>Need Help?</Text>
          <Text style={styles.emergencyText}>
            If this is an emergency, call 911 immediately.
          </Text>
          <Button
            variant="danger"
            onPress={handleEmergencyCall}
            style={styles.emergencyButton}
            accessibilityLabel="Call emergency services"
          >
            🚨 Call 911
          </Button>
        </View>

        {/* Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Contacts</Text>
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <ContactCard key={index} {...contact} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No contacts yet. Ask your guardian to add you.
              </Text>
            </Card>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use I'm Okay</Text>
          <Card>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>💚</Text>
              <Text style={styles.tipText}>
                Press the big green button every day to let your family know you're okay.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>⏰</Text>
              <Text style={styles.tipText}>
                You'll get a gentle reminder when it's time to check in.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>📱</Text>
              <Text style={styles.tipText}>
                Your guardian will be notified when you check in.
              </Text>
            </View>
          </Card>
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
  emergencyBanner: {
    backgroundColor: Colors.light.danger,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  emergencyTitle: {
    ...Typography.h2,
    color: Colors.light.surface,
    marginBottom: Spacing.xs,
  },
  emergencyText: {
    ...Typography.body,
    color: Colors.light.surface,
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  emergencyButton: {
    backgroundColor: Colors.light.surface,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  contactRelationship: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipText: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
  },
});
