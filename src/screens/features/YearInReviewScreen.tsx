import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

// Components
import { AppText, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { AppButton, IconButton } from '../../components/common/AppButton';
import { DonutChart, Sparkline } from '../../components/analytics/Charts';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// YEAR IN REVIEW SCREEN
// ═══════════════════════════════════════════════════════════════
export const YearInReviewScreen = () => {
  const navigation = useNavigation();
  const { subscriptions, getStats } = useSubscriptionStore();
  const stats = getStats();
  
  const currentYear = new Date().getFullYear();
  
  // Calculate yearly stats
  const totalYearlySpend = stats.totalAnnualSpend;
  const avgMonthlySpend = stats.totalMonthlySpend;
  const subsList = subscriptions || [];
  const totalSubscriptions = subsList.length;
  const activeSubscriptions = subsList.filter(s => s.isActive && !s.isArchived).length;
  const archivedThisYear = subsList.filter(s => s.isArchived).length;

  // Category breakdown
  const categoryData = Object.entries(stats.categoryBreakdown || {})
    .map(([label, value]) => ({
      label,
      value: value * 12, // Annualize
      color: Colors.categories[label.toLowerCase() as keyof typeof Colors.categories] || Colors.primary,
    }))
    .sort((a, b) => b.value - a.value);

  const topCategory = categoryData[0];

  // Calculate real 12-month trend from subscriptions
  const calculateMonthlyTrend = () => {
    const monthlySpending: number[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      let monthTotal = 0;
      subsList.forEach(sub => {
        if (!sub.startDate || sub.isArchived) return;
        const startDate = new Date(sub.startDate);
        if (startDate > monthEnd) return;
        
        let monthlyAmount = sub.amount / (sub.sharedWith || 1);
        if (sub.billingCycle === 'yearly') monthlyAmount = monthlyAmount / 12;
        if (sub.billingCycle === 'weekly') monthlyAmount = monthlyAmount * 4.33;
        
        if (sub.isActive) {
          monthTotal += monthlyAmount;
        }
      });
      
      monthlySpending.push(monthTotal);
    }
    
    return monthlySpending.length > 0 ? monthlySpending : [0, 0];
  };

  const monthlyTrend = calculateMonthlyTrend();

  // Fun facts
  const funFacts = [
    {
      icon: 'cafe' as const,
      stat: Math.round(totalYearlySpend / 5),
      label: 'coffees worth',
      color: Colors.warning,
    },
    {
      icon: 'airplane' as const,
      stat: Math.round(totalYearlySpend / 500),
      label: 'weekend trips',
      color: Colors.info,
    },
    {
      icon: 'restaurant' as const,
      stat: Math.round(totalYearlySpend / 25),
      label: 'dinners out',
      color: Colors.success,
    },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My ${currentYear} SubSync Wrapped:\n💰 Total Spent: ${CurrencyService.format(totalYearlySpend)}\n📱 ${activeSubscriptions} active subscriptions\n🏆 Top category: ${topCategory?.label || 'N/A'}\n\n#SubSync #YearInReview`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={[Colors.primary, Colors.copper, Colors.background]}
        locations={[0, 0.3, 0.6]}
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
            icon="close" 
            onPress={() => navigation.goBack()} 
            variant="default"
            color={Colors.text.inverse}
          />
          <View style={{ flex: 1 }} />
          <IconButton 
            icon="share-outline" 
            onPress={handleShare} 
            variant="default"
            color={Colors.text.inverse}
          />
        </Animated.View>

        {/* Hero Title */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <AppText variant="regular" size="lg" color={Colors.text.inverse} style={styles.yearLabel}>
            Your
          </AppText>
          <AppText variant="serifBold" size="7xl" color={Colors.text.inverse} style={styles.yearNumber}>
            {currentYear}
          </AppText>
          <AppText variant="serifMedium" size="2xl" color={Colors.text.inverse}>
            Year in Review
          </AppText>
        </Animated.View>

        {/* Total Spend Card */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <PremiumCard variant="glass" style={styles.totalCard}>
            <Label color={Colors.text.secondary}>Total Subscription Spend</Label>
            <AppText variant="serifBold" size="5xl" color={Colors.text.primary}>
              {CurrencyService.format(totalYearlySpend)}
            </AppText>
            <View style={styles.totalMeta}>
              <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
                That's <AppText variant="semibold" color={Colors.primary}>
                  {CurrencyService.format(avgMonthlySpend)}/month
                </AppText> on average
              </AppText>
            </View>

            {/* Spending Trend */}
            <View style={styles.trendContainer}>
              <Caption>Monthly Spending Trend</Caption>
              <Sparkline
                data={monthlyTrend}
                width={SCREEN_WIDTH - Layout.screen.paddingHorizontal * 2 - Spacing['8']}
                height={60}
                color={Colors.primary}
              />
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.statsGrid}
        >
          <StatCard
            icon="checkmark-circle"
            value={activeSubscriptions.toString()}
            label="Active"
            color={Colors.success}
          />
          <StatCard
            icon="archive"
            value={archivedThisYear.toString()}
            label="Canceled"
            color={Colors.warning}
          />
          <StatCard
            icon="layers"
            value={categoryData.length.toString()}
            label="Categories"
            color={Colors.info}
          />
          <StatCard
            icon="flame"
            value={CurrencyService.format(stats.burnRate).replace('$', '')}
            label="Daily"
            color={Colors.error}
          />
        </Animated.View>

        {/* Top Category */}
        {topCategory && (
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <PremiumCard variant="default" style={styles.topCategoryCard}>
              <View style={styles.topCategoryHeader}>
                <View style={[styles.topCategoryBadge, { backgroundColor: topCategory.color }]}>
                  <Ionicons name="trophy" size={24} color={Colors.text.inverse} />
                </View>
                <View style={styles.topCategoryInfo}>
                  <Caption>Your #1 Category</Caption>
                  <AppText variant="serifBold" size="2xl">{topCategory.label}</AppText>
                  <AppText variant="medium" size="base" color={Colors.primary}>
                    {CurrencyService.format(topCategory.value)} this year
                  </AppText>
                </View>
              </View>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Category Breakdown */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Where Your Money Went</Label>
          <PremiumCard variant="default">
            <View style={styles.chartContainer}>
              <DonutChart
                data={categoryData}
                size={180}
                strokeWidth={28}
                centerValue={categoryData.length.toString()}
                centerLabel="Categories"
              />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {categoryData.slice(0, 5).map((cat) => (
                <View key={cat.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <AppText variant="medium" size="sm" style={{ flex: 1 }}>{cat.label}</AppText>
                  <AppText variant="semibold" size="sm" color={Colors.text.secondary}>
                    {CurrencyService.format(cat.value)}
                  </AppText>
                </View>
              ))}
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Fun Facts */}
        <Animated.View 
          entering={FadeInUp.delay(700).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Your Spend Could've Been...</Label>
          <View style={styles.funFactsRow}>
            {funFacts.map((fact, index) => (
              <PremiumCard key={index} variant="default" padding="md" style={styles.funFactCard}>
                <View style={[styles.funFactIcon, { backgroundColor: `${fact.color}15` }]}>
                  <Ionicons name={fact.icon} size={20} color={fact.color} />
                </View>
                <AppText variant="serifBold" size="2xl" style={{ marginTop: Spacing['2'] }}>
                  {fact.stat}
                </AppText>
                <Caption>{fact.label}</Caption>
              </PremiumCard>
            ))}
          </View>
        </Animated.View>

        {/* Share Button */}
        <Animated.View entering={FadeInUp.delay(800).springify()}>
          <AppButton
            title="Share My Wrapped"
            onPress={handleShare}
            variant="gradient"
            size="lg"
            icon="share-social"
          />
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
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}

const StatCard = ({ icon, value, label, color }: StatCardProps) => (
  <PremiumCard variant="default" padding="md" style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <AppText variant="serifBold" size="xl" style={{ marginTop: Spacing['2'] }}>{value}</AppText>
    <Caption>{label}</Caption>
  </PremiumCard>
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
    height: 500,
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
    paddingVertical: Spacing['8'],
  },
  yearLabel: {
    opacity: 0.8,
  },
  yearNumber: {
    lineHeight: 96,
  },
  totalCard: {
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  totalMeta: {
    marginTop: Spacing['2'],
  },
  trendContainer: {
    width: '100%',
    marginTop: Spacing['5'],
    paddingTop: Spacing['4'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['3'],
    marginBottom: Spacing['5'],
  },
  statCard: {
    width: (SCREEN_WIDTH - Layout.screen.paddingHorizontal * 2 - Spacing['3']) / 2 - 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCategoryCard: {
    marginBottom: Spacing['5'],
  },
  topCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCategoryBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCategoryInfo: {
    marginLeft: Spacing['4'],
    flex: 1,
  },
  section: {
    marginBottom: Spacing['5'],
  },
  sectionTitle: {
    marginBottom: Spacing['3'],
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4'],
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing['4'],
    gap: Spacing['3'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing['3'],
  },
  funFactsRow: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  funFactCard: {
    flex: 1,
    alignItems: 'center',
  },
  funFactIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
