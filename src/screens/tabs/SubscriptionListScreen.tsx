import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  FadeInUp,
  FadeInDown,
  Layout as ReanimatedLayout,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Components
import { AppText, Label, Caption, H1 } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { IconButton } from '../../components/common/AppButton';

// Theme
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';
import { Springs, Duration } from '../../theme/animations';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';
import { Subscription } from '../../types/subscription';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

type FilterTab = 'active' | 'archived' | 'all';
type SortOption = 'name' | 'amount' | 'renewal' | 'category';

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION LIST SCREEN
// ═══════════════════════════════════════════════════════════════
export const SubscriptionListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { subscriptions, removeSubscription, updateSubscription, archiveSubscription } = useSubscriptionStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [sortBy, setSortBy] = useState<SortOption>('renewal');
  const [refreshing, setRefreshing] = useState(false);

  // Filter subscriptions
  const subsList = subscriptions || [];
  const filteredSubs = subsList
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => {
      switch (activeTab) {
        case 'active': return !s.isArchived && s.isActive;
        case 'archived': return s.isArchived;
        default: return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'amount': return b.amount - a.amount;
        case 'renewal': return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

  const totalMonthlyFiltered = filteredSubs.reduce((sum, s) => {
    if (s.isActive && !s.isArchived) {
      const monthly = s.billingCycle === 'yearly' ? s.amount / 12 : 
                      s.billingCycle === 'weekly' ? s.amount * 4.33 : s.amount;
      return sum + (monthly / (s.sharedWith || 1));
    }
    return sum;
  }, 0);

  const handleTrackUsage = (id: string, currentCount: number = 0) => {
    updateSubscription(id, { 
      usageCount: (currentCount || 0) + 1,
      lastUsedDate: new Date().toISOString()
    });
    Toast.show({ type: 'success', text1: t('common.success'), visibilityTime: 1500 });
  };

  const handleRestore = (id: string) => {
    updateSubscription(id, { isArchived: false, isActive: true });
    Toast.show({ type: 'success', text1: 'Subscription restored' });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient background */}
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={['rgba(212, 165, 116, 0.05)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <View>
          <AppText variant="regular" size="sm" color={Colors.text.tertiary} uppercase letterSpacing={1}>
            {t('dashboard.totalMonthly')}
          </AppText>
          <AppText variant="serifBold" size="3xl">{t('common.subscriptions')}</AppText>
        </View>
        <IconButton
          icon="add"
          onPress={() => navigation.navigate('AddSubscription' as never)}
          variant="accent"
          size="md"
        />
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        style={styles.searchContainer}
      >
        <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={Colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.filterContainer}
      >
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'active' && styles.filterTabActive]}
            onPress={() => setActiveTab('active')}
          >
            <AppText variant="medium" size="sm" color={activeTab === 'active' ? Colors.text.inverse : Colors.text.tertiary}>
              {t('common.active')}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'archived' && styles.filterTabActive]}
            onPress={() => setActiveTab('archived')}
          >
            <AppText variant="medium" size="sm" color={activeTab === 'archived' ? Colors.text.inverse : Colors.text.tertiary}>
              {t('common.archived')}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <AppText variant="medium" size="sm" color={activeTab === 'all' ? Colors.text.inverse : Colors.text.tertiary}>
              {t('common.all')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Sort Options */}
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical-outline" size={18} color={Colors.text.secondary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Summary Bar */}
      {filteredSubs.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(250).springify()}
          style={styles.summaryBar}
        >
          <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
            {filteredSubs.length} subscription{filteredSubs.length !== 1 ? 's' : ''}
          </AppText>
          <AppText variant="semibold" size="sm" color={Colors.primary}>
            {CurrencyService.format(totalMonthlyFiltered)}/mo
          </AppText>
        </Animated.View>
      )}

      {/* Subscription List */}
      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <SwipeableSubscriptionCard
            item={item}
            index={index}
            onTrackUsage={() => handleTrackUsage(item.id, item.usageCount)}
            onArchive={() => archiveSubscription(item.id)}
            onRestore={() => handleRestore(item.id)}
            onDelete={() => removeSubscription(item.id)}
            onEdit={() => (navigation as any).navigate('AddSubscription', { subscriptionId: item.id })}
          />
        )}
        ListEmptyComponent={() => (
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={styles.emptyState}
          >
            <View style={styles.emptyIcon}>
              <Ionicons
                name={activeTab === 'active' ? 'receipt-outline' : 'archive-outline'}
                size={48}
                color={Colors.text.tertiary}
              />
            </View>
            <AppText variant="semibold" size="lg" color={Colors.text.secondary} style={{ marginTop: Spacing['4'] }}>
              {activeTab === 'active' ? 'No active subscriptions' : 'No archived subscriptions'}
            </AppText>
            <Caption align="center" style={{ marginTop: Spacing['2'], maxWidth: 260 }}>
              {activeTab === 'active'
                ? 'Tap the + button to add your first subscription and start tracking'
                : 'Subscriptions you archive will appear here'}
            </Caption>
          </Animated.View>
        )}
        ListFooterComponent={<View style={{ height: Layout.screen.paddingBottom }} />}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════
// SWIPEABLE SUBSCRIPTION CARD
// ═══════════════════════════════════════════════════════════════
interface SwipeableCardProps {
  item: Subscription;
  index: number;
  onTrackUsage: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SwipeableSubscriptionCard = ({
  item,
  index,
  onTrackUsage,
  onArchive,
  onRestore,
  onDelete,
  onEdit,
}: SwipeableCardProps) => {
  const translateX = useSharedValue(0);
  const isSwipedOpen = useSharedValue(false);

  const categoryColor = Colors.categories[
    item.category.toLowerCase() as keyof typeof Colors.categories
  ] || Colors.primary;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -140);
      } else if (isSwipedOpen.value) {
        translateX.value = Math.min(-140 + event.translationX, 0);
      }
    })
    .onEnd(() => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-140, Springs.snappy);
        isSwipedOpen.value = true;
      } else {
        translateX.value = withSpring(0, Springs.snappy);
        isSwipedOpen.value = false;
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -70], [0, 1]),
    transform: [
      { scale: interpolate(translateX.value, [0, -70], [0.8, 1]) },
    ],
  }));

  const closeSwipe = () => {
    translateX.value = withSpring(0, Springs.snappy);
    isSwipedOpen.value = false;
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).springify()}
      layout={ReanimatedLayout.springify()}
      exiting={SlideOutLeft}
      style={styles.swipeContainer}
    >
      {/* Background Actions */}
      <Animated.View style={[styles.swipeActions, actionsStyle]}>
        {!item.isArchived ? (
          <>
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: Colors.info }]}
              onPress={() => { onTrackUsage(); closeSwipe(); }}
            >
              <Ionicons name="stats-chart" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: Colors.warning }]}
              onPress={() => { onArchive(); closeSwipe(); }}
            >
              <Ionicons name="archive" size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: Colors.success }]}
              onPress={() => { onRestore(); closeSwipe(); }}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.swipeAction, { backgroundColor: Colors.error }]}
              onPress={() => { onDelete(); closeSwipe(); }}
            >
              <Ionicons name="trash" size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      {/* Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, cardStyle]}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onEdit} 
            style={styles.subscriptionCard}
          >
            {/* Category Indicator */}
            <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
            
            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardMain}>
                <View style={styles.cardInfo}>
                  <AppText variant="semibold" size="lg" numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <View style={styles.cardMeta}>
                    <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
                      {item.category}
                    </AppText>
                    <View style={styles.metaDot} />
                    <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
                      {item.billingCycle}
                    </AppText>
                    {(item.sharedWith || 1) > 1 && (
                      <>
                        <View style={styles.metaDot} />
                        <Ionicons name="people" size={12} color={Colors.text.tertiary} />
                        <AppText variant="regular" size="sm" color={Colors.text.tertiary} style={{ marginLeft: 2 }}>
                          ÷{item.sharedWith}
                        </AppText>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.cardAmount}>
                  <AppText variant="serifBold" size="xl" color={Colors.primary}>
                    {CurrencyService.format(item.amount / (item.sharedWith || 1), item.currency)}
                  </AppText>
                  {item.usageCount !== undefined && item.usageCount > 0 && (
                    <View style={styles.usageBadge}>
                      <Ionicons name="checkmark" size={10} color={Colors.success} />
                      <AppText variant="medium" size="2xs" color={Colors.success} style={{ marginLeft: 2 }}>
                        {item.usageCount} uses
                      </AppText>
                    </View>
                  )}
                </View>
              </View>

              {/* Renewal Date */}
              <View style={styles.cardFooter}>
                <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
                <AppText variant="regular" size="xs" color={Colors.text.tertiary} style={{ marginLeft: 4 }}>
                  Renews {new Date(item.nextRenewalDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </AppText>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

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
    height: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screen.paddingHorizontal,
    paddingTop: Layout.screen.paddingTop,
    marginBottom: Spacing['4'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.screen.paddingHorizontal,
    marginBottom: Spacing['3'],
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.DEFAULT,
    paddingHorizontal: Spacing['4'],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing['3'],
    color: Colors.text.primary,
    fontFamily: Fonts.SansMedium,
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.screen.paddingHorizontal,
    marginBottom: Spacing['3'],
    gap: Spacing['3'],
  },
  filterTabs: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing['2'],
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  sortButton: {
    width: 44,
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Layout.screen.paddingHorizontal,
    marginBottom: Spacing['3'],
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.sm,
  },
  listContent: {
    paddingHorizontal: Layout.screen.paddingHorizontal,
  },
  swipeContainer: {
    marginBottom: Spacing['3'],
    position: 'relative',
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    paddingRight: Spacing['1'],
  },
  swipeAction: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    backgroundColor: Colors.background,
  },
  subscriptionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  categoryIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing['4'],
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['1'],
    flexWrap: 'wrap',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.text.tertiary,
    marginHorizontal: Spacing['2'],
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['1'],
    paddingHorizontal: Spacing['2'],
    paddingVertical: 2,
    backgroundColor: Colors.successMuted,
    borderRadius: BorderRadius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['3'],
    paddingTop: Spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['16'],
    paddingHorizontal: Spacing['8'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
