import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText, CurrencyText, Label, Caption } from '../common/AppText';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { Duration, Springs } from '../../theme/animations';

// ═══════════════════════════════════════════════════════════════
// HERO SPEND CARD - Main dashboard hero showing monthly commitment
// ═══════════════════════════════════════════════════════════════
interface HeroSpendCardProps {
  monthlySpend: string;
  dailyBurn: string;
  lifetimeSpend: string;
  activeCount: number;
  style?: ViewStyle;
  labels?: {
    monthlyTotal?: string;
    dailyBurn?: string;
    lifetimeInvested?: string;
    activeTitle?: string;
  };
}

export const HeroSpendCard = ({
  monthlySpend,
  dailyBurn,
  lifetimeSpend,
  activeCount,
  style,
  labels,
}: HeroSpendCardProps) => {
  const enterAnim = useSharedValue(0);
  const numberAnim = useSharedValue(0);

  useEffect(() => {
    enterAnim.value = withSpring(1, Springs.gentle);
    numberAnim.value = withDelay(200, withTiming(1, { 
      duration: Duration.slow, 
      easing: Easing.out(Easing.cubic) 
    }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: enterAnim.value,
    transform: [{ translateY: interpolate(enterAnim.value, [0, 1], [20, 0]) }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberAnim.value,
    transform: [{ scale: interpolate(numberAnim.value, [0, 1], [0.95, 1]) }],
  }));

  return (
    <Animated.View style={[styles.heroContainer, containerStyle, style]}>
      <LinearGradient
        colors={['rgba(212, 165, 116, 0.08)', 'rgba(212, 165, 116, 0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative elements */}
      <View style={styles.heroDecorator}>
        <View style={styles.decorCircle} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
      </View>

      {/* Content */}
      <View style={styles.heroContent}>
        <Label style={{ marginBottom: 8 }}>{labels?.monthlyTotal || 'Monthly Commitment'}</Label>
        
        <Animated.View style={numberStyle}>
          <CurrencyText color={Colors.text.primary} style={styles.heroAmount}>
            {monthlySpend}
          </CurrencyText>
        </Animated.View>

        {/* Stats row */}
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
              {labels?.dailyBurn || 'Daily Burn'}
            </AppText>
            <AppText variant="serifMedium" size="lg" color={Colors.primary}>
              {dailyBurn}
            </AppText>
          </View>
          
          <View style={styles.heroDivider} />
          
          <View style={styles.heroStat}>
            <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
              {labels?.lifetimeInvested || 'Total Spent'}
            </AppText>
            <AppText variant="serifMedium" size="lg" color={Colors.text.primary}>
              {lifetimeSpend}
            </AppText>
          </View>
          
          <View style={styles.heroDivider} />
          
          <View style={styles.heroStat}>
            <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
              {labels?.activeTitle || 'Active'}
            </AppText>
            <AppText variant="serifMedium" size="lg" color={Colors.text.primary}>
              {activeCount}
            </AppText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// QUICK STAT CARD - Compact metric display
// ═══════════════════════════════════════════════════════════════
interface QuickStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
  style?: ViewStyle;
}

export const QuickStatCard = ({
  icon,
  iconColor,
  value,
  label,
  trend,
  delay = 0,
  style,
}: QuickStatCardProps) => {
  const enterAnim = useSharedValue(0);

  useEffect(() => {
    enterAnim.value = withDelay(delay, withSpring(1, Springs.gentle));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterAnim.value,
    transform: [
      { translateY: interpolate(enterAnim.value, [0, 1], [16, 0]) },
      { scale: interpolate(enterAnim.value, [0, 1], [0.95, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.quickStatCard, animatedStyle, style]}>
      <View style={[styles.quickStatIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      
      <AppText variant="serifBold" size="xl" style={{ marginTop: 12 }}>
        {value}
      </AppText>
      
      <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
        {label}
      </AppText>
      
      {trend && (
        <View style={styles.trendBadge}>
          <Ionicons 
            name={trend.positive ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={trend.positive ? Colors.success : Colors.error} 
          />
          <AppText 
            variant="medium" 
            size="2xs" 
            color={trend.positive ? Colors.success : Colors.error}
            style={{ marginLeft: 2 }}
          >
            {trend.value}
          </AppText>
        </View>
      )}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// INSIGHT CARD - Actionable insight with icon
// ═══════════════════════════════════════════════════════════════
interface InsightCardProps {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const InsightCard = ({
  type,
  title,
  description,
  action,
  onDismiss,
  style,
}: InsightCardProps) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return { 
          icon: 'warning-outline' as const, 
          color: Colors.warning,
          bg: Colors.warningMuted,
        };
      case 'success':
        return { 
          icon: 'checkmark-circle-outline' as const, 
          color: Colors.success,
          bg: Colors.successMuted,
        };
      case 'tip':
        return { 
          icon: 'bulb-outline' as const, 
          color: Colors.primary,
          bg: Colors.primaryMuted,
        };
      default:
        return { 
          icon: 'information-circle-outline' as const, 
          color: Colors.info,
          bg: Colors.infoMuted,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <View style={[styles.insightCard, { backgroundColor: config.bg }, style]}>
      <View style={styles.insightContent}>
        <View style={[styles.insightIcon, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        
        <View style={styles.insightText}>
          <AppText variant="semibold" size="sm" color={config.color}>
            {title}
          </AppText>
          <AppText variant="regular" size="sm" color={Colors.text.secondary} style={{ marginTop: 2 }}>
            {description}
          </AppText>
        </View>

        {onDismiss && (
          <Ionicons 
            name="close" 
            size={18} 
            color={Colors.text.tertiary} 
            onPress={onDismiss}
          />
        )}
      </View>

      {action && (
        <View style={styles.insightAction}>
          <AppText 
            variant="medium" 
            size="sm" 
            color={config.color}
            onPress={action.onPress}
          >
            {action.label} →
          </AppText>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// RENEWAL PREVIEW CARD - Upcoming renewal item
// ═══════════════════════════════════════════════════════════════
interface RenewalPreviewProps {
  name: string;
  category: string;
  categoryColor: string;
  date: string;
  amount: string;
  sharedWith?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const RenewalPreviewCard = ({
  name,
  category,
  categoryColor,
  date,
  amount,
  sharedWith,
  onPress,
  style,
}: RenewalPreviewProps) => {
  const { t } = useTranslation();
  return (
    <View style={[styles.renewalCard, style]}>
      <View style={[styles.renewalIndicator, { backgroundColor: categoryColor }]} />
      
      <View style={styles.renewalInfo}>
        <AppText variant="semibold" size="base">{name}</AppText>
        <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
          {date}
        </AppText>
      </View>
      
      <View style={styles.renewalAmount}>
        <AppText variant="serifBold" size="lg" color={Colors.primary}>
          {amount}
        </AppText>
        {sharedWith && sharedWith > 1 && (
          <AppText variant="regular" size="2xs" color={Colors.text.tertiary}>
            {t('common.splitWays', { count: sharedWith }) || `split ${sharedWith} ways`}
          </AppText>
        )}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Hero Card
  heroContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecorator: {
    position: 'absolute',
    top: -60,
    right: -60,
  },
  decorCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: 30,
    left: 30,
    backgroundColor: 'rgba(212, 165, 116, 0.03)',
  },
  heroContent: {
    padding: Spacing['6'],
    alignItems: 'center',
  },
  heroAmount: {
    marginVertical: Spacing['2'],
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['5'],
    paddingTop: Spacing['5'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },

  // Quick Stat Card
  quickStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['4'],
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['2'],
    paddingHorizontal: Spacing['2'],
    paddingVertical: Spacing['1'],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.elevated,
  },

  // Insight Card
  insightCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing['4'],
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  insightText: {
    flex: 1,
  },
  insightAction: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: Spacing['3'],
    paddingTop: Spacing['3'],
  },

  // Renewal Card
  renewalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['4'],
    marginBottom: Spacing['2'],
  },
  renewalIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing['4'],
  },
  renewalInfo: {
    flex: 1,
  },
  renewalAmount: {
    alignItems: 'flex-end',
  },
});
