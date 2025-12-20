import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Components
import { AppText, Label, Caption, H1 } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { DonutChart, BarChart, ProgressRing, Sparkline } from '../../components/analytics/Charts';

// Theme
import { useTheme } from '../../theme/ThemeContext';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeRange = 'month' | 'quarter' | 'year';

// ═══════════════════════════════════════════════════════════════
// ANALYTICS SCREEN
// ═══════════════════════════════════════════════════════════════
export const AnalyticsScreen = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { getStats, subscriptions } = useSubscriptionStore();
  const stats = getStats();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const subsList = subscriptions || [];
  const activeCount = subsList.filter(s => s.isActive && !s.isArchived).length;
  const archivedCount = subsList.filter(s => s.isArchived).length;
  const totalCount = subsList.length;

  // Category data for charts
  const categoryData = Object.entries(stats.categoryBreakdown || {})
    .map(([label, value]) => ({
      label,
      value,
      color: colors.categories[label.toLowerCase()] || colors.primary,
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate real 12-month trend from subscriptions
  const calculateTrendData = () => {
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
        if (sub.isActive) monthTotal += monthlyAmount;
      });
      monthlySpending.push(monthTotal);
    }
    return monthlySpending.length > 0 ? monthlySpending : [0, 0];
  };

  const trendData = calculateTrendData();
  const trendChange = trendData.length >= 2 && trendData[0] > 0 
    ? ((trendData[trendData.length - 1] - trendData[0]) / trendData[0] * 100).toFixed(1)
    : '0.0';

  const getHealthScore = () => {
    if (totalCount === 0) return 0;
    let score = 100;
    const unusedCount = subsList.filter(s => s.isActive && !s.isArchived && (s.usageCount || 0) === 0).length;
    score -= (unusedCount / activeCount) * 30;
    if (stats.totalMonthlySpend > 200) score -= 10;
    if (stats.totalMonthlySpend > 500) score -= 20;
    if (archivedCount > 0) score += 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = getHealthScore();
  const healthColor = healthScore >= 70 ? colors.success : 
                       healthScore >= 40 ? colors.warning : colors.error;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={[isDark ? 'rgba(126, 184, 214, 0.06)' : 'rgba(126, 184, 214, 0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <AppText variant="regular" size="sm" color={colors.text.secondary} uppercase letterSpacing={2}>
              {t('analytics.financialInsights')}
            </AppText>
            <AppText variant="serifBold" size="3xl">{t('analytics.title')}</AppText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.timeSelector, { backgroundColor: colors.surface }]}>
          {(['month', 'quarter', 'year'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeButton, timeRange === range && { backgroundColor: colors.primary }]}
              onPress={() => setTimeRange(range)}
            >
              <AppText variant="medium" size="sm" color={timeRange === range ? colors.text.inverse : colors.text.secondary}>
                {range === 'month' ? t('analytics.thisMonth') : range === 'quarter' ? t('analytics.quarter') : t('analytics.year')}
              </AppText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <PremiumCard variant="default" style={styles.overviewCard}>
            <Label style={{ marginBottom: Spacing['4'] }}>{t('analytics.spendingOverview') || 'Spending Overview'}</Label>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Caption>{t('dashboard.totalMonthly')}</Caption>
                <AppText variant="serifBold" size="2xl" color={colors.text.primary}>
                  {CurrencyService.format(stats.totalMonthlySpend)}
                </AppText>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.overviewItem}>
                <Caption>{t('analytics.annualProjection')}</Caption>
                <AppText variant="serifBold" size="2xl" color={colors.text.primary}>
                  {CurrencyService.format(stats.totalAnnualSpend)}
                </AppText>
              </View>
            </View>
            <View style={[styles.trendContainer, { borderTopColor: colors.border }]}>
              <View style={styles.trendHeader}>
                <View>
                  <Caption>{t('analytics.trend') || '12-Month Trend'}</Caption>
                  <AppText variant="semibold" size="md" color={parseFloat(trendChange) >= 0 ? colors.error : colors.success}>
                    <Ionicons name={parseFloat(trendChange) >= 0 ? "trending-up" : "trending-down"} size={14} /> {parseFloat(trendChange) >= 0 ? '+' : ''}{trendChange}%
                  </AppText>
                </View>
                <Sparkline data={trendData} width={120} height={36} color={parseFloat(trendChange) >= 0 ? colors.error : colors.success} />
              </View>
            </View>
            <View style={[styles.lifetimeBar, { borderTopColor: colors.border }]}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={{ marginLeft: Spacing['3'], flex: 1 }}>
                <Caption>{t('dashboard.lifetime')}</Caption>
                <AppText variant="serifBold" size="xl" color={colors.primary}>
                  {CurrencyService.format(stats.lifetimeSpend)}
                </AppText>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('analytics.portfolioHealth') || 'Portfolio Health'}</Label>
          <View style={styles.healthRow}>
            <PremiumCard variant="default" style={styles.healthCard}>
              <ProgressRing progress={healthScore} size={100} strokeWidth={10} color={healthColor} value={`${healthScore}`} label="Score" />
              <AppText variant="medium" size="sm" color={healthColor} style={{ marginTop: Spacing['3'] }}>
                {healthScore >= 70 ? t('analytics.healthExcellent') : healthScore >= 40 ? t('analytics.healthFair') : t('analytics.healthNeedsWork')}
              </AppText>
            </PremiumCard>
            <View style={styles.statsGrid}>
              <MiniStatCard icon="checkmark-circle" color={colors.success} value={activeCount.toString()} label={t('common.active')} />
              <MiniStatCard icon="archive" color={colors.warning} value={archivedCount.toString()} label={t('common.archived')} />
              <MiniStatCard icon="layers" color={colors.info} value={Object.keys(stats.categoryBreakdown || {}).length.toString()} label={t('common.categories')} />
              <MiniStatCard icon="flame" color={colors.error} value={CurrencyService.format(stats.burnRate).replace('$', '')} label={t('common.daily')} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('analytics.categoryBreakdown')}</Label>
          {categoryData.length > 0 ? (
            <PremiumCard variant="default">
              <View style={styles.chartContainer}>
                <DonutChart data={categoryData} size={180} strokeWidth={24} centerValue={CurrencyService.format(stats.totalMonthlySpend)} centerLabel={t('common.monthly')} />
              </View>
              <View style={[styles.barChartContainer, { borderTopColor: colors.border }]}>
                <BarChart data={categoryData} formatValue={(v) => CurrencyService.format(v)} />
              </View>
              <View style={[styles.legend, { borderTopColor: colors.border }]}>
                {categoryData.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <AppText variant="regular" size="sm" color={colors.text.secondary}>{item.label}</AppText>
                  </View>
                ))}
              </View>
            </PremiumCard>
          ) : (
            <PremiumCard variant="default" style={styles.emptyCard}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.text.tertiary} />
              <AppText variant="medium" size="base" color={colors.text.tertiary} style={{ marginTop: Spacing['3'] }}>{t('analytics.emptyData')}</AppText>
            </PremiumCard>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
          <Label style={styles.sectionTitle}>{t('analytics.smartInsights') || 'Smart Insights'}</Label>
          <View style={styles.insightsGrid}>
            <InsightTile icon="wallet-outline" iconColor={colors.primary} title={t('analytics.avgPerSub')} value={activeCount > 0 ? CurrencyService.format(stats.totalMonthlySpend / activeCount) : '$0'} />
            <InsightTile icon="calendar-outline" iconColor={colors.info} title={t('analytics.next30Days')} value={CurrencyService.format(stats.upcomingCharges?.days30 || stats.totalMonthlySpend)} />
            <InsightTile icon="stats-chart-outline" iconColor={colors.success} title={t('analytics.valueScore')} value={`${Math.round(healthScore * 0.8)}%`} />
          </View>
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MiniStatCard = ({ icon, color, value, label }: any) => {
  const { colors } = useTheme();
  return (
    <PremiumCard variant="default" style={styles.miniStatCard}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="serifBold" size="xl" style={{ marginTop: Spacing['2'] }}>{value}</AppText>
      <Caption>{label}</Caption>
    </PremiumCard>
  );
};

const InsightTile = ({ icon, iconColor, title, value }: any) => {
  const { colors } = useTheme();
  return (
    <PremiumCard variant="default" padding="md" style={styles.insightTile}>
      <View style={[styles.insightIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Caption style={{ marginTop: Spacing['2'] }}>{title}</Caption>
      <AppText variant="serifBold" size="lg" color={colors.text.primary}>{value}</AppText>
    </PremiumCard>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  ambientBg: { ...StyleSheet.absoluteFillObject, height: 400 },
  scrollContent: { paddingHorizontal: Layout.screen.paddingHorizontal, paddingTop: Layout.screen.paddingTop },
  header: { marginBottom: Spacing['4'] },
  timeSelector: { flexDirection: 'row', borderRadius: BorderRadius.md, padding: 4, marginBottom: Spacing['5'] },
  timeButton: { flex: 1, paddingVertical: Spacing['2'], alignItems: 'center', borderRadius: BorderRadius.sm },
  overviewCard: { marginBottom: Spacing['5'] },
  overviewGrid: { flexDirection: 'row' },
  overviewItem: { flex: 1 },
  overviewDivider: { width: 1, marginHorizontal: Spacing['4'] },
  trendContainer: { marginTop: Spacing['5'], paddingTop: Spacing['4'], borderTopWidth: 1 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lifetimeBar: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing['5'], paddingTop: Spacing['4'], borderTopWidth: 1 },
  section: { marginBottom: Spacing['6'] },
  sectionTitle: { marginBottom: Spacing['3'] },
  healthRow: { flexDirection: 'row', gap: Spacing['3'] },
  healthCard: { width: 140, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] },
  miniStatCard: { width: '48%', flexGrow: 1, alignItems: 'center', paddingVertical: Spacing['3'] },
  chartContainer: { alignItems: 'center', paddingVertical: Spacing['4'] },
  barChartContainer: { marginTop: Spacing['4'], paddingTop: Spacing['4'], borderTopWidth: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing['4'], paddingTop: Spacing['3'], borderTopWidth: 1, gap: Spacing['3'] },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing['2'] },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing['10'] },
  insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['3'] },
  insightTile: { width: (SCREEN_WIDTH - Layout.screen.paddingHorizontal * 2 - Spacing['3']) / 2 - 1 },
  insightIcon: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
});
