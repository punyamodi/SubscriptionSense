import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, differenceInDays, parseISO, differenceInMonths } from 'date-fns';
import Toast from 'react-native-toast-message';

// Components
import { AppText, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { AppButton, IconButton } from '../../components/common/AppButton';
import { ProgressRing, Sparkline } from '../../components/analytics/Charts';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';
import { Subscription } from '../../types/subscription';

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION DETAILS SCREEN
// ═══════════════════════════════════════════════════════════════
interface RouteParams {
  subscriptionId?: string;
}

export const SubscriptionDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { subscriptions, updateSubscription, archiveSubscription, removeSubscription } = useSubscriptionStore();
  
  // Get subscription from route params or use first one for demo
  const subscriptionId = route.params?.subscriptionId;
  const subsList = subscriptions || [];
  const subscription = subsList.find(s => s.id === subscriptionId) || subsList[0];

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={Colors.text.tertiary} />
          <AppText variant="semibold" size="lg" color={Colors.text.secondary} style={{ marginTop: Spacing['4'] }}>
            Subscription not found
          </AppText>
          <AppButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{ marginTop: Spacing['4'] }}
            fullWidth={false}
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = Colors.categories[
    subscription.category.toLowerCase() as keyof typeof Colors.categories
  ] || Colors.primary;

  // Calculated values
  const monthlyAmount = subscription.billingCycle === 'yearly' 
    ? subscription.amount / 12 
    : subscription.billingCycle === 'weekly'
    ? subscription.amount * 4.33
    : subscription.amount;

  const personalAmount = monthlyAmount / (subscription.sharedWith || 1);
  const daysUntilRenewal = differenceInDays(new Date(subscription.nextRenewalDate), new Date());
  const monthsActive = differenceInMonths(new Date(), parseISO(subscription.startDate)) + 1;
  const lifetimeSpend = personalAmount * monthsActive;

  // Usage stats
  const usageCount = subscription.usageCount || 0;
  const costPerUse = usageCount > 0 ? lifetimeSpend / usageCount : lifetimeSpend;
  
  // Health score based on usage
  const getHealthScore = () => {
    if (usageCount === 0) return 30;
    const expectedMonthlyUses = subscription.billingCycle === 'weekly' ? 16 : 4;
    const actualMonthlyUses = usageCount / Math.max(1, monthsActive);
    const ratio = actualMonthlyUses / expectedMonthlyUses;
    return Math.min(100, Math.round(ratio * 100));
  };
  const healthScore = getHealthScore();
  const healthColor = healthScore >= 70 ? Colors.success : healthScore >= 40 ? Colors.warning : Colors.error;

  // Mock usage trend
  const usageTrend = [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, usageCount > 0 ? usageCount : 5];

  const handleTrackUsage = () => {
    updateSubscription(subscription.id, {
      usageCount: (subscription.usageCount || 0) + 1,
      lastUsedDate: new Date().toISOString(),
    });
    Toast.show({ type: 'success', text1: 'Usage tracked!' });
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Subscription',
      `Are you sure you want to archive ${subscription.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          onPress: () => {
            archiveSubscription(subscription.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Subscription',
      `This will permanently delete ${subscription.name}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeSubscription(subscription.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Category color gradient */}
      <LinearGradient
        colors={[`${categoryColor}20`, 'transparent']}
        style={styles.gradientBg}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <IconButton 
            icon="arrow-back" 
            onPress={() => navigation.goBack()} 
            variant="filled"
          />
          <View style={{ flex: 1 }} />
          <IconButton 
            icon="create-outline" 
            onPress={() => (navigation as any).navigate('AddSubscription', { subscriptionId: subscription.id })} 
            variant="filled"
          />
          <IconButton 
            icon="ellipsis-vertical" 
            onPress={() => {}} 
            variant="filled"
            style={{ marginLeft: Spacing['2'] }}
          />
        </Animated.View>

        {/* Hero Section */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Ionicons name="receipt" size={32} color={Colors.text.inverse} />
          </View>
          <AppText variant="serifBold" size="3xl" style={{ marginTop: Spacing['4'] }}>
            {subscription.name}
          </AppText>
          <View style={styles.categoryTag}>
            <AppText variant="medium" size="sm" color={categoryColor}>
              {subscription.category}
            </AppText>
          </View>
        </Animated.View>

        {/* Price Card */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <PremiumCard variant="default" style={styles.priceCard}>
            <View style={styles.priceMain}>
              <AppText variant="serifBold" size="5xl" color={Colors.text.primary}>
                {CurrencyService.format(personalAmount)}
              </AppText>
              <AppText variant="regular" size="lg" color={Colors.text.tertiary}>
                /{subscription.billingCycle === 'yearly' ? 'mo' : subscription.billingCycle.slice(0, -2)}
              </AppText>
            </View>

            {(subscription.sharedWith || 1) > 1 && (
              <View style={styles.splitBadge}>
                <Ionicons name="people" size={14} color={Colors.info} />
                <AppText variant="medium" size="sm" color={Colors.info} style={{ marginLeft: 4 }}>
                  Split {subscription.sharedWith} ways • Full price: {CurrencyService.format(monthlyAmount)}
                </AppText>
              </View>
            )}

            {/* Renewal countdown */}
            <View style={styles.renewalBar}>
              <Ionicons name="calendar" size={18} color={Colors.text.tertiary} />
              <View style={{ marginLeft: Spacing['3'], flex: 1 }}>
                <Caption>Next Renewal</Caption>
                <AppText variant="semibold" size="base">
                  {format(new Date(subscription.nextRenewalDate), 'MMMM d, yyyy')}
                </AppText>
              </View>
              <View style={[styles.daysChip, daysUntilRenewal <= 3 && { backgroundColor: Colors.warningMuted }]}>
                <AppText 
                  variant="semibold" 
                  size="sm" 
                  color={daysUntilRenewal <= 3 ? Colors.warning : Colors.text.secondary}
                >
                  {daysUntilRenewal} days
                </AppText>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Health Score */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Value Health Score</Label>
          <PremiumCard variant="default">
            <View style={styles.healthContent}>
              <ProgressRing
                progress={healthScore}
                size={100}
                strokeWidth={10}
                color={healthColor}
                value={`${healthScore}`}
                label="Score"
              />
              <View style={styles.healthInfo}>
                <AppText variant="semibold" size="lg" color={healthColor}>
                  {healthScore >= 70 ? 'Great Value' : healthScore >= 40 ? 'Fair Usage' : 'Underused'}
                </AppText>
                <Caption style={{ marginTop: Spacing['1'] }}>
                  {healthScore >= 70 
                    ? "You're getting good value from this subscription"
                    : healthScore >= 40
                    ? 'Consider using this service more often'
                    : 'You might want to reconsider this subscription'}
                </Caption>
                <TouchableOpacity 
                  style={styles.trackButton} 
                  onPress={handleTrackUsage}
                >
                  <Ionicons name="add-circle" size={18} color={Colors.primary} />
                  <AppText variant="medium" size="sm" color={Colors.primary} style={{ marginLeft: 6 }}>
                    Track Usage
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.statsGrid}
        >
          <StatCard
            label="Lifetime Spend"
            value={CurrencyService.format(lifetimeSpend)}
            icon="wallet"
            color={Colors.primary}
          />
          <StatCard
            label="Cost Per Use"
            value={CurrencyService.format(costPerUse)}
            icon="calculator"
            color={usageCount > 0 ? Colors.success : Colors.warning}
          />
          <StatCard
            label="Total Uses"
            value={usageCount.toString()}
            icon="checkmark-circle"
            color={Colors.info}
          />
          <StatCard
            label="Months Active"
            value={monthsActive.toString()}
            icon="time"
            color={Colors.text.secondary}
          />
        </Animated.View>

        {/* Usage Trend */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Usage Trend</Label>
          <PremiumCard variant="default">
            <Sparkline
              data={usageTrend}
              width={280}
              height={60}
              color={categoryColor}
            />
            <Caption style={{ marginTop: Spacing['3'], textAlign: 'center' }}>
              Last 12 months
            </Caption>
          </PremiumCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View 
          entering={FadeInUp.delay(700).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Actions</Label>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="archive-outline"
              label="Archive"
              onPress={handleArchive}
            />
            <ActionCard
              icon="trash-outline"
              label="Delete"
              onPress={handleDelete}
              danger
            />
          </View>
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <PremiumCard variant="default" padding="md" style={styles.statCard}>
    <Ionicons name={icon} size={18} color={color} />
    <AppText variant="serifBold" size="lg" style={{ marginTop: Spacing['2'] }}>{value}</AppText>
    <Caption>{label}</Caption>
  </PremiumCard>
);

// ═══════════════════════════════════════════════════════════════
// ACTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const ActionCard = ({ icon, label, onPress, danger }: ActionCardProps) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <Ionicons name={icon} size={22} color={danger ? Colors.error : Colors.text.secondary} />
    <AppText 
      variant="medium" 
      size="sm" 
      color={danger ? Colors.error : Colors.text.secondary}
      style={{ marginTop: Spacing['2'] }}
    >
      {label}
    </AppText>
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    paddingHorizontal: Layout.screen.paddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Layout.screen.paddingTop,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing['6'],
  },
  categoryBadge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    marginTop: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  priceCard: {
    marginBottom: Spacing['5'],
    alignItems: 'center',
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1.5'],
    backgroundColor: Colors.infoMuted,
    borderRadius: BorderRadius.full,
  },
  renewalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing['5'],
    paddingTop: Spacing['4'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  daysChip: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
  },
  section: {
    marginBottom: Spacing['5'],
  },
  sectionTitle: {
    marginBottom: Spacing['3'],
  },
  healthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthInfo: {
    flex: 1,
    marginLeft: Spacing['5'],
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['3'],
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['3'],
    marginBottom: Spacing['5'],
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['4'],
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
