import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import { AppText, Label, Caption, H1 } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { AppButton, IconButton } from '../../components/common/AppButton';
import { ProgressRing, BarChart } from '../../components/analytics/Charts';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';
import { Fonts } from '../../theme/typography';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

// ═══════════════════════════════════════════════════════════════
// BUDGET PLANNER SCREEN
// ═══════════════════════════════════════════════════════════════
export const BudgetPlannerScreen = () => {
  const navigation = useNavigation();
  const { getStats, subscriptions } = useSubscriptionStore();
  const stats = getStats();
  
  const [monthlyBudget, setMonthlyBudget] = useState('500');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  const currentSpend = stats.totalMonthlySpend;
  const budgetAmount = parseFloat(monthlyBudget) || 0;
  const budgetUsedPercent = budgetAmount > 0 ? Math.min(100, (currentSpend / budgetAmount) * 100) : 0;
  const remaining = Math.max(0, budgetAmount - currentSpend);
  const isOverBudget = currentSpend > budgetAmount;

  // Category spending data
  const categoryData = Object.entries(stats.categoryBreakdown || {}).map(([label, value]) => ({
    label,
    value,
    color: Colors.categories[label.toLowerCase() as keyof typeof Colors.categories] || Colors.primary,
    budget: parseFloat(categoryBudgets[label] || '0') || 0,
  }));

  // AI Budget Suggestion
  const suggestedBudget = Math.round(currentSpend * 1.1 / 10) * 10; // 10% buffer, rounded

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient gradient */}
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={[isOverBudget ? 'rgba(217, 115, 115, 0.08)' : 'rgba(126, 207, 163, 0.08)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

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
          <View style={styles.headerTitle}>
            <Label>Financial Planning</Label>
            <AppText variant="serifBold" size="2xl">Budget Planner</AppText>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Budget Overview Ring */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <PremiumCard variant={isOverBudget ? 'default' : 'default'} style={styles.overviewCard}>
            <View style={styles.budgetRingContainer}>
              <ProgressRing
                progress={budgetUsedPercent}
                size={160}
                strokeWidth={14}
                color={isOverBudget ? Colors.error : budgetUsedPercent > 80 ? Colors.warning : Colors.success}
                value={`${Math.round(budgetUsedPercent)}%`}
                label="Used"
              />
            </View>

            <View style={styles.budgetStats}>
              <View style={styles.budgetStatItem}>
                <Caption>Spent</Caption>
                <AppText variant="serifBold" size="xl" color={isOverBudget ? Colors.error : Colors.text.primary}>
                  {CurrencyService.format(currentSpend)}
                </AppText>
              </View>
              <View style={styles.budgetStatDivider} />
              <View style={styles.budgetStatItem}>
                <Caption>Remaining</Caption>
                <AppText variant="serifBold" size="xl" color={Colors.success}>
                  {CurrencyService.format(remaining)}
                </AppText>
              </View>
            </View>

            {isOverBudget && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={18} color={Colors.error} />
                <AppText variant="medium" size="sm" color={Colors.error} style={{ marginLeft: Spacing['2'] }}>
                  You're ${Math.round(currentSpend - budgetAmount)} over budget
                </AppText>
              </View>
            )}
          </PremiumCard>
        </Animated.View>

        {/* Set Monthly Budget */}
        <Animated.View 
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Monthly Budget</Label>
          <PremiumCard variant="default">
            <View style={styles.budgetInputRow}>
              <AppText variant="serifBold" size="3xl" color={Colors.text.tertiary}>$</AppText>
              <TextInput
                style={styles.budgetInput}
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
              />
              <AppText variant="regular" size="lg" color={Colors.text.tertiary}>/month</AppText>
            </View>

            {/* Quick Suggestions */}
            <View style={styles.suggestions}>
              <Caption style={{ marginBottom: Spacing['2'] }}>Quick Set</Caption>
              <View style={styles.suggestionButtons}>
                {[100, 250, 500, suggestedBudget].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.suggestionButton,
                      amount === suggestedBudget && styles.suggestionButtonAI,
                    ]}
                    onPress={() => setMonthlyBudget(amount.toString())}
                  >
                    <AppText variant="medium" size="sm" color={Colors.text.primary}>
                      ${amount}
                    </AppText>
                    {amount === suggestedBudget && (
                      <AppText variant="regular" size="2xs" color={Colors.primary}>AI</AppText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Category Budgets */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Label>Category Limits</Label>
            <TouchableOpacity>
              <AppText variant="medium" size="sm" color={Colors.primary}>Auto-Set</AppText>
            </TouchableOpacity>
          </View>

          {categoryData.length > 0 ? (
            categoryData.map((cat) => {
              const catBudget = cat.budget || budgetAmount * 0.3;
              const catPercent = catBudget > 0 ? Math.min(100, (cat.value / catBudget) * 100) : 0;
              const isOverCat = cat.value > catBudget;

              return (
                <PremiumCard key={cat.label} variant="default" padding="md" style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                      <AppText variant="semibold" size="base">{cat.label}</AppText>
                    </View>
                    <View style={styles.categorySpend}>
                      <AppText variant="serifMedium" size="base" color={isOverCat ? Colors.error : Colors.text.primary}>
                        {CurrencyService.format(cat.value)}
                      </AppText>
                      <Caption> / {CurrencyService.format(catBudget)}</Caption>
                    </View>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={styles.categoryProgressBg}>
                      <Animated.View
                        style={[
                          styles.categoryProgressFill,
                          { 
                            width: `${catPercent}%`, 
                            backgroundColor: isOverCat ? Colors.error : cat.color 
                          }
                        ]}
                      />
                    </View>
                  </View>
                </PremiumCard>
              );
            })
          ) : (
            <PremiumCard variant="default" style={styles.emptyCard}>
              <Ionicons name="pie-chart-outline" size={40} color={Colors.text.tertiary} />
              <Caption style={{ marginTop: Spacing['2'] }}>Add subscriptions to see categories</Caption>
            </PremiumCard>
          )}
        </Animated.View>

        {/* Insights */}
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Budget Insights</Label>
          <View style={styles.insightsGrid}>
            <InsightTile
              icon="trending-down"
              iconColor={Colors.success}
              title="Potential Savings"
              value={CurrencyService.format(currentSpend * 0.15)}
              subtitle="15% reduction possible"
            />
            <InsightTile
              icon="calendar"
              iconColor={Colors.info}
              title="Days Until Reset"
              value={`${30 - new Date().getDate()}`}
              subtitle="Budget resets monthly"
            />
          </View>
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// INSIGHT TILE COMPONENT
// ═══════════════════════════════════════════════════════════════
interface InsightTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  subtitle: string;
}

const InsightTile = ({ icon, iconColor, title, value, subtitle }: InsightTileProps) => (
  <PremiumCard variant="default" padding="md" style={styles.insightTile}>
    <View style={[styles.insightIcon, { backgroundColor: `${iconColor}15` }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Caption style={{ marginTop: Spacing['2'] }}>{title}</Caption>
    <AppText variant="serifBold" size="xl">{value}</AppText>
    <Caption>{subtitle}</Caption>
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
  ambientBg: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
  },
  scrollContent: {
    paddingHorizontal: Layout.screen.paddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Layout.screen.paddingTop,
    marginBottom: Spacing['5'],
  },
  headerTitle: {
    flex: 1,
    marginLeft: Spacing['3'],
  },
  overviewCard: {
    alignItems: 'center',
    marginBottom: Spacing['5'],
  },
  budgetRingContainer: {
    marginBottom: Spacing['5'],
  },
  budgetStats: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing['4'],
  },
  budgetStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['4'],
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    backgroundColor: Colors.errorMuted,
    borderRadius: BorderRadius.full,
  },
  section: {
    marginBottom: Spacing['5'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  sectionTitle: {
    marginBottom: Spacing['3'],
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetInput: {
    fontFamily: Fonts.SerifBold,
    fontSize: 48,
    color: Colors.text.primary,
    textAlign: 'center',
    minWidth: 120,
    padding: 0,
  },
  suggestions: {
    marginTop: Spacing['4'],
    paddingTop: Spacing['4'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suggestionButtons: {
    flexDirection: 'row',
    gap: Spacing['2'],
  },
  suggestionButton: {
    flex: 1,
    paddingVertical: Spacing['2'],
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionButtonAI: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  categoryCard: {
    marginBottom: Spacing['2'],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2'],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing['2'],
  },
  categorySpend: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categoryProgress: {
    marginTop: Spacing['2'],
  },
  categoryProgressBg: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['8'],
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  insightTile: {
    flex: 1,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
