import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';

// Components
import { AppText, H1, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { IconButton } from '../../components/common/AppButton';
import { 
  HeroSpendCard, 
  QuickStatCard, 
  InsightCard,
  RenewalPreviewCard,
} from '../../components/dashboard/DashboardCards';
import { SearchModal } from '../../components/modals/SearchModal';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';
import { Springs } from '../../theme/animations';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SCREEN
// ═══════════════════════════════════════════════════════════════
export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { subscriptions, getStats } = useSubscriptionStore();
  const stats = getStats();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Export subscription data as JSON
  const handleExport = async () => {
    try {
      const dataToExport = {
        subscriptions: subscriptions,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const fileUri = (FileSystem.documentDirectory || '') + 'subsync_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToExport, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Toast.show({ type: 'info', text1: 'Sharing not available', text2: 'Data saved locally' });
      }
    } catch (error) {
      console.warn(error);
      Toast.show({ type: 'error', text1: 'Export Failed', text2: 'Could not export data' });
    }
  };

  // Computed data
  const activeSubs = (subscriptions || []).filter(s => s.isActive && !s.isArchived);
  const upcomingRenewals = activeSubs
    .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime())
    .slice(0, 3);

  const trialsEndingSoon = (subscriptions || []).filter(s => {
    if (!s.trialEndDate || s.isArchived) return false;
    try {
      const daysLeft = differenceInDays(parseISO(s.trialEndDate), new Date());
      return daysLeft >= 0 && daysLeft <= 7;
    } catch {
      return false;
    }
  });

  // Unused subscription detection (no usage in 30+ days)
  const unusedSubs = activeSubs.filter(s => {
    if (!s.lastUsedDate) return s.usageCount === 0;
    const daysSinceUse = differenceInDays(new Date(), parseISO(s.lastUsedDate));
    return daysSinceUse > 30;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient background */}
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={['rgba(212, 165, 116, 0.08)', 'transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <View>
            <AppText variant="regular" size="sm" color={Colors.text.secondary}>
              {getGreeting()}
            </AppText>
            <AppText variant="serifBold" size="3xl" color={Colors.text.primary}>
              Dashboard
            </AppText>
          </View>
          
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications-outline"
              onPress={() => {}}
              variant="filled"
              size="md"
            />
            <IconButton
              icon="add"
              onPress={() => navigation.navigate('AddSubscription' as never)}
              variant="accent"
              size="md"
              style={{ marginLeft: Spacing['2'] }}
            />
          </View>
        </Animated.View>

        {/* Hero Spend Card */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <HeroSpendCard
            monthlySpend={CurrencyService.format(stats.totalMonthlySpend)}
            dailyBurn={CurrencyService.format(stats.burnRate)}
            lifetimeSpend={CurrencyService.format(stats.lifetimeSpend)}
            activeCount={activeSubs.length}
            style={styles.heroCard}
          />
        </Animated.View>

        {/* Trial Alerts */}
        {trialsEndingSoon.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(300).springify()}
            style={styles.section}
          >
            {trialsEndingSoon.map((trial, index) => {
              const daysLeft = differenceInDays(parseISO(trial.trialEndDate!), new Date());
              return (
                <InsightCard
                  key={trial.id}
                  type="warning"
                  title={`${trial.name} trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                  description={`Will charge ${CurrencyService.format(trial.amount)} after trial`}
                  action={{
                    label: 'View Details',
                    onPress: () => {},
                  }}
                  style={{ marginBottom: Spacing['2'] }}
                />
              );
            })}
          </Animated.View>
        )}

        {/* Unused Subscription Alert */}
        {unusedSubs.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(350).springify()}
            style={styles.section}
          >
            <InsightCard
              type="tip"
              title={`${unusedSubs.length} subscription${unusedSubs.length > 1 ? 's' : ''} unused`}
              description={`You could save ${CurrencyService.format(
                unusedSubs.reduce((sum, s) => sum + (s.amount / (s.sharedWith || 1)), 0)
              )}/month by canceling`}
              action={{
                label: 'Review Subscriptions',
                onPress: () => navigation.navigate('Ledger' as never),
              }}
            />
          </Animated.View>
        )}

        {/* Quick Stats Grid */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.statsGrid}
        >
          <QuickStatCard
            icon="trending-up-outline"
            iconColor={Colors.success}
            value={CurrencyService.format(stats.totalAnnualSpend)}
            label="Annual Projection"
            delay={0}
          />
          <QuickStatCard
            icon="layers-outline"
            iconColor={Colors.info}
            value={Object.keys(stats.categoryBreakdown).length.toString()}
            label="Categories"
            delay={50}
          />
        </Animated.View>

        {/* Upcoming Renewals */}
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Label>Upcoming Renewals</Label>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar' as never)}>
              <AppText variant="medium" size="sm" color={Colors.primary}>
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {upcomingRenewals.length > 0 ? (
            upcomingRenewals.map((sub, index) => {
              const categoryColor = Colors.categories[
                sub.category.toLowerCase() as keyof typeof Colors.categories
              ] || Colors.primary;
              
              return (
                <RenewalPreviewCard
                  key={sub.id}
                  name={sub.name}
                  category={sub.category}
                  categoryColor={categoryColor}
                  date={format(new Date(sub.nextRenewalDate), 'MMM d')}
                  amount={CurrencyService.format(sub.amount / (sub.sharedWith || 1))}
                  sharedWith={sub.sharedWith}
                />
              );
            })
          ) : (
            <PremiumCard variant="default" style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color={Colors.text.tertiary} />
              <AppText 
                variant="medium" 
                size="base" 
                color={Colors.text.tertiary}
                style={{ marginTop: Spacing['3'] }}
              >
                No upcoming renewals
              </AppText>
            </PremiumCard>
          )}
        </Animated.View>

        {/* Spending by Category Preview */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Label>Top Categories</Label>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics' as never)}>
              <AppText variant="medium" size="sm" color={Colors.primary}>
                View Analytics
              </AppText>
            </TouchableOpacity>
          </View>

          <PremiumCard variant="default" padding="md">
            {Object.entries(stats.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([category, amount], index) => {
                const categoryColor = Colors.categories[
                  category.toLowerCase() as keyof typeof Colors.categories
                ] || Colors.primary;
                const maxAmount = Math.max(...Object.values(stats.categoryBreakdown));
                const percent = (amount / maxAmount) * 100;

                return (
                  <View key={category} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                      <AppText variant="medium" size="sm" style={{ flex: 1 }}>
                        {category}
                      </AppText>
                    </View>
                    <View style={styles.categoryBar}>
                      <View style={styles.categoryBarBg}>
                        <Animated.View 
                          style={[
                            styles.categoryBarFill,
                            { width: `${percent}%`, backgroundColor: categoryColor }
                          ]}
                        />
                      </View>
                    </View>
                    <AppText variant="semibold" size="sm" color={Colors.text.secondary}>
                      {CurrencyService.format(amount)}
                    </AppText>
                  </View>
                );
              })}

            {Object.keys(stats.categoryBreakdown).length === 0 && (
              <View style={styles.emptyCategoryState}>
                <Ionicons name="pie-chart-outline" size={32} color={Colors.text.tertiary} />
                <Caption style={{ marginTop: Spacing['2'] }}>
                  No spending data yet
                </Caption>
              </View>
            )}
          </PremiumCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.delay(700).springify()}
          style={styles.section}
        >
          <Label style={{ marginBottom: Spacing['3'] }}>Quick Actions</Label>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Add"
              onPress={() => navigation.navigate('AddSubscription' as never)}
            />
            <QuickAction
              icon="search-outline"
              label="Search"
              onPress={() => setShowSearchModal(true)}
            />
            <QuickAction
              icon="download-outline"
              label="Export"
              onPress={handleExport}
            />
            <QuickAction
              icon="settings-outline"
              label="Settings"
              onPress={() => navigation.navigate('Settings' as never)}
            />
          </View>
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom }} />
      </ScrollView>
      
      {/* Search Modal */}
      <SearchModal 
        visible={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════
interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Ionicons name={icon} size={22} color={Colors.primary} />
    </View>
    <AppText variant="medium" size="xs" color={Colors.text.secondary}>
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
  ambientBg: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
  },
  scrollContent: {
    paddingHorizontal: Layout.screen.paddingHorizontal,
    paddingTop: Layout.screen.paddingTop,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['6'],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCard: {
    marginBottom: Spacing['5'],
  },
  section: {
    marginBottom: Spacing['6'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing['3'],
    marginBottom: Spacing['6'],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['8'],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing['2'],
  },
  categoryBar: {
    flex: 1,
    marginHorizontal: Spacing['3'],
  },
  categoryBarBg: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCategoryState: {
    alignItems: 'center',
    paddingVertical: Spacing['6'],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2'],
  },
});
