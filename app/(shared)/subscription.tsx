/**
 * Subscription Screen
 * 
 * Premium upgrade and subscription management.
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { Shadows } from '@/constants/Shadows';

export default function SubscriptionScreen() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      features: ['1 dependent', '1 daily check-in', 'Push notifications'],
      isCurrent: true,
    },
    {
      name: 'Premium',
      price: '$4.99',
      period: '/month',
      features: ['Unlimited dependents', 'Multiple check-in windows', 'SMS alerts', 'Analytics'],
      isCurrent: false,
      isPopular: true,
    },
    {
      name: 'Family',
      price: '$7.99',
      period: '/month',
      features: ['Everything in Premium', 'Multiple guardians', 'Shared dashboard'],
      isCurrent: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>Choose the plan that's right for you</Text>
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          {plans.map((plan, index) => (
            <View
              key={index}
              style={[
                styles.planCard,
                plan.isPopular && styles.popularPlanCard,
              ]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              
              <View style={styles.featuresList}>
                {plan.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItem}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <Pressable
                style={[
                  styles.planButton,
                  plan.isCurrent && styles.currentPlanButton,
                  plan.isPopular && styles.popularPlanButton,
                ]}
              >
                <Text
                  style={[
                    styles.planButtonText,
                    plan.isCurrent && styles.currentPlanButtonText,
                    plan.isPopular && styles.popularPlanButtonText,
                  ]}
                >
                  {plan.isCurrent ? 'Current Plan' : 'Upgrade'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Restore Purchases */}
        <View style={styles.restoreSection}>
          <Pressable style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </Pressable>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.light.accent,
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
  plansSection: {
    paddingHorizontal: Spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  popularBadgeText: {
    ...Typography.caption,
    color: Colors.light.surface,
    fontWeight: '600',
  },
  planName: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  planPrice: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  planPeriod: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  featuresList: {
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureCheck: {
    ...Typography.body,
    color: Colors.light.primary,
    marginRight: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  planButton: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  currentPlanButton: {
    backgroundColor: Colors.light.border,
  },
  popularPlanButton: {
    backgroundColor: Colors.light.primary,
  },
  planButtonText: {
    ...Typography.button,
    color: Colors.light.text,
  },
  currentPlanButtonText: {
    color: Colors.light.textSecondary,
  },
  popularPlanButtonText: {
    color: Colors.light.surface,
  },
  restoreSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  restoreButton: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  restoreButtonText: {
    ...Typography.button,
    color: Colors.light.accent,
  },
});
