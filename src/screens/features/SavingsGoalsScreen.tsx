import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, addMonths, differenceInDays } from 'date-fns';

// Components
import { AppText, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { AppButton, IconButton } from '../../components/common/AppButton';
import { ProgressRing } from '../../components/analytics/Charts';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';
import { Fonts } from '../../theme/typography';
import { Springs } from '../../theme/animations';

// Services
import { CurrencyService } from '../../services/currency.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const SAMPLE_GOALS: SavingsGoal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 2750,
    deadline: addMonths(new Date(), 6),
    icon: 'shield-checkmark',
    color: Colors.success,
  },
  {
    id: '2',
    name: 'Cancel Netflix Savings',
    targetAmount: 180,
    currentAmount: 45,
    deadline: addMonths(new Date(), 12),
    icon: 'tv',
    color: Colors.categories.streaming,
  },
  {
    id: '3',
    name: 'Vacation Fund',
    targetAmount: 2000,
    currentAmount: 800,
    deadline: addMonths(new Date(), 8),
    icon: 'airplane',
    color: Colors.info,
  },
];

// ═══════════════════════════════════════════════════════════════
// SAVINGS GOALS SCREEN
// ═══════════════════════════════════════════════════════════════
export const SavingsGoalsScreen = () => {
  const navigation = useNavigation();
  const [goals, setGoals] = useState<SavingsGoal[]>(SAMPLE_GOALS);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Potential savings from subscriptions
  const potentialMonthlySavings = 45; // Would come from unused subscription detection

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient gradient */}
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={['rgba(126, 207, 163, 0.08)', 'transparent']}
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
            <Label>Financial Goals</Label>
            <AppText variant="serifBold" size="2xl">Savings Goals</AppText>
          </View>
          <IconButton 
            icon="add" 
            onPress={() => setShowAddModal(true)} 
            variant="accent"
          />
        </Animated.View>

        {/* Overall Progress */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <PremiumCard variant="accent" glow style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Caption color={Colors.primary}>Total Progress</Caption>
                <AppText variant="serifBold" size="4xl" color={Colors.text.primary}>
                  {CurrencyService.format(totalSaved)}
                </AppText>
                <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
                  of {CurrencyService.format(totalTarget)} goal
                </AppText>
              </View>
              <ProgressRing
                progress={overallProgress}
                size={100}
                strokeWidth={10}
                color={Colors.success}
                value={`${Math.round(overallProgress)}%`}
                label="Saved"
              />
            </View>

            {/* Potential savings tip */}
            <View style={styles.tipBanner}>
              <Ionicons name="bulb" size={16} color={Colors.warning} />
              <AppText variant="medium" size="sm" color={Colors.text.secondary} style={{ marginLeft: Spacing['2'], flex: 1 }}>
                You could save an extra <AppText variant="semibold" color={Colors.primary}>${potentialMonthlySavings}/mo</AppText> by canceling unused subscriptions
              </AppText>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Goals List */}
        <Animated.View 
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Your Goals ({goals.length})</Label>
          
          {goals.map((goal, index) => (
            <GoalCard key={goal.id} goal={goal} index={index} />
          ))}
        </Animated.View>

        {/* Add Goal Button */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <TouchableOpacity style={styles.addGoalCard} onPress={() => setShowAddModal(true)}>
            <View style={styles.addGoalIcon}>
              <Ionicons name="add" size={28} color={Colors.primary} />
            </View>
            <View style={styles.addGoalText}>
              <AppText variant="semibold" size="base">Create New Goal</AppText>
              <Caption>Set a savings target and track your progress</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Savings Tips */}
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>Savings Tips</Label>
          
          <View style={styles.tipsGrid}>
            <TipCard
              icon="swap-horizontal"
              title="Split Services"
              description="Share subscriptions with family to reduce costs by up to 50%"
              color={Colors.info}
            />
            <TipCard
              icon="calendar"
              title="Annual Plans"
              description="Switch to yearly billing and save 15-20% on average"
              color={Colors.success}
            />
            <TipCard
              icon="trash"
              title="Audit Monthly"
              description="Review unused subscriptions every month"
              color={Colors.warning}
            />
            <TipCard
              icon="pricetag"
              title="Student Discounts"
              description="Many services offer 50%+ off for students"
              color={Colors.categories.education}
            />
          </View>
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// GOAL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface GoalCardProps {
  goal: SavingsGoal;
  index: number;
}

const GoalCard = ({ goal, index }: GoalCardProps) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysLeft = differenceInDays(goal.deadline, new Date());
  const monthlyNeeded = goal.targetAmount > goal.currentAmount 
    ? (goal.targetAmount - goal.currentAmount) / Math.max(1, daysLeft / 30)
    : 0;

  return (
    <PremiumCard variant="default" style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIcon, { backgroundColor: `${goal.color}15` }]}>
          <Ionicons name={goal.icon} size={22} color={goal.color} />
        </View>
        <View style={styles.goalInfo}>
          <AppText variant="semibold" size="lg">{goal.name}</AppText>
          <View style={styles.goalMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.text.tertiary} />
            <Caption style={{ marginLeft: 4 }}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Goal reached!'}
            </Caption>
          </View>
        </View>
        <View style={styles.goalProgress}>
          <AppText variant="serifBold" size="lg" color={goal.color}>
            {Math.round(progress)}%
          </AppText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.goalProgressBar}>
        <View style={styles.goalProgressBg}>
          <Animated.View
            style={[
              styles.goalProgressFill,
              { width: `${Math.min(100, progress)}%`, backgroundColor: goal.color }
            ]}
          />
        </View>
      </View>

      {/* Amounts */}
      <View style={styles.goalAmounts}>
        <View>
          <Caption>Saved</Caption>
          <AppText variant="semibold" size="base" color={goal.color}>
            {CurrencyService.format(goal.currentAmount)}
          </AppText>
        </View>
        <View style={styles.goalAmountRight}>
          <Caption>Target</Caption>
          <AppText variant="semibold" size="base">
            {CurrencyService.format(goal.targetAmount)}
          </AppText>
        </View>
      </View>

      {/* Monthly needed */}
      {monthlyNeeded > 0 && (
        <View style={styles.monthlyNeeded}>
          <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
            Save <AppText variant="semibold" color={Colors.text.secondary}>{CurrencyService.format(monthlyNeeded)}/mo</AppText> to reach your goal
          </AppText>
        </View>
      )}
    </PremiumCard>
  );
};

// ═══════════════════════════════════════════════════════════════
// TIP CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface TipCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const TipCard = ({ icon, title, description, color }: TipCardProps) => (
  <View style={styles.tipCard}>
    <View style={[styles.tipIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <AppText variant="semibold" size="sm" style={{ marginTop: Spacing['2'] }}>{title}</AppText>
    <Caption style={{ marginTop: Spacing['1'] }}>{description}</Caption>
  </View>
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
    height: 500,
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
  heroCard: {
    marginBottom: Spacing['5'],
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['4'],
    paddingTop: Spacing['4'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  section: {
    marginBottom: Spacing['5'],
  },
  sectionTitle: {
    marginBottom: Spacing['3'],
  },
  goalCard: {
    marginBottom: Spacing['3'],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: Spacing['3'],
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  goalProgress: {
    alignItems: 'flex-end',
  },
  goalProgressBar: {
    marginTop: Spacing['4'],
  },
  goalProgressBg: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing['3'],
  },
  goalAmountRight: {
    alignItems: 'flex-end',
  },
  monthlyNeeded: {
    marginTop: Spacing['3'],
    paddingTop: Spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing['4'],
    marginBottom: Spacing['5'],
  },
  addGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.DEFAULT,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGoalText: {
    flex: 1,
    marginLeft: Spacing['3'],
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['3'],
  },
  tipCard: {
    width: (SCREEN_WIDTH - Layout.screen.paddingHorizontal * 2 - Spacing['3']) / 2 - 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['4'],
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
