/**
 * Subscription screen for the I'm Okay app.
 * Manage premium subscription and view features.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants';

interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  family: boolean | string;
}

const features: PlanFeature[] = [
  { name: 'Dependents', free: '1', premium: 'Unlimited', family: 'Unlimited' },
  { name: 'Check-in windows', free: '1/day', premium: 'Multiple', family: 'Multiple' },
  { name: 'Push notifications', free: true, premium: true, family: true },
  { name: 'SMS alerts', free: false, premium: true, family: true },
  { name: 'Multiple guardians', free: false, premium: false, family: true },
  { name: 'Analytics dashboard', free: false, premium: true, family: true },
];

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  isCurrentPlan?: boolean;
  onSelect: () => void;
}

function PlanCard({ name, price, period, isCurrentPlan, onSelect }: PlanCardProps) {
  const cardStyle = [styles.planCard, isCurrentPlan ? styles.planCardCurrent : undefined];
  
  return (
    <Card style={cardStyle}>
      {isCurrentPlan && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>Current Plan</Text>
        </View>
      )}
      <Text style={styles.planName}>{name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>{period}</Text>
      </View>
      <Button
        variant={isCurrentPlan ? 'secondary' : 'primary'}
        onPress={onSelect}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
      </Button>
    </Card>
  );
}

function FeatureCheck({ available }: { available: boolean | string }) {
  if (typeof available === 'string') {
    return <Text style={styles.featureValue}>{available}</Text>;
  }
  return (
    <Text style={[styles.featureIcon, { color: available ? Colors.light.primary : Colors.light.textDisabled }]}>
      {available ? '✓' : '—'}
    </Text>
  );
}

type PlanTier = 'free' | 'premium' | 'family';

export default function SubscriptionScreen() {
  // TODO: Get actual subscription status from RevenueCat
  const [currentPlan] = useState<PlanTier>('free');

  const handleSelectPlan = (plan: string) => {
    // TODO: Implement RevenueCat purchase flow
    console.log('Selected plan:', plan);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Upgrade to unlock more features and better protect your loved ones.
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <PlanCard
            name="Free"
            price="$0"
            period="forever"
            isCurrentPlan={currentPlan === 'free'}
            onSelect={() => handleSelectPlan('free')}
          />
          <PlanCard
            name="Premium"
            price="$4.99"
            period="/month"
            isCurrentPlan={currentPlan === 'premium'}
            onSelect={() => handleSelectPlan('premium')}
          />
          <PlanCard
            name="Family"
            price="$7.99"
            period="/month"
            isCurrentPlan={currentPlan === 'family'}
            onSelect={() => handleSelectPlan('family')}
          />
        </View>

        {/* Feature Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Compare Plans</Text>
          <Card padding="none">
            {/* Header Row */}
            <View style={styles.comparisonHeader}>
              <Text style={[styles.featureName, styles.headerText]}>Feature</Text>
              <Text style={[styles.featureColumn, styles.headerText]}>Free</Text>
              <Text style={[styles.featureColumn, styles.headerText]}>Premium</Text>
              <Text style={[styles.featureColumn, styles.headerText]}>Family</Text>
            </View>
            
            {/* Feature Rows */}
            {features.map((feature, index) => (
              <View key={feature.name} style={[styles.featureRow, index > 0 && styles.featureRowBorder]}>
                <Text style={styles.featureName}>{feature.name}</Text>
                <View style={styles.featureColumn}>
                  <FeatureCheck available={feature.free} />
                </View>
                <View style={styles.featureColumn}>
                  <FeatureCheck available={feature.premium} />
                </View>
                <View style={styles.featureColumn}>
                  <FeatureCheck available={feature.family} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Restore Purchases */}
        <View style={styles.restoreContainer}>
          <Button variant="ghost" onPress={() => {}}>
            Restore Purchases
          </Button>
          <Text style={styles.restoreText}>
            Already subscribed? Restore your purchases here.
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
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  planCard: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  planCardCurrent: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  currentBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  currentBadgeText: {
    ...Typography.caption,
    color: Colors.light.surface,
    fontWeight: '600',
  },
  planName: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  price: {
    ...Typography.h1,
    color: Colors.light.primary,
  },
  period: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  comparisonSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  headerText: {
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  featureRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  featureName: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    flex: 1.5,
  },
  featureColumn: {
    flex: 1,
    alignItems: 'center',
  },
  featureValue: {
    ...Typography.caption,
    color: Colors.light.text,
    fontWeight: '600',
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreContainer: {
    alignItems: 'center',
  },
  restoreText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
});
