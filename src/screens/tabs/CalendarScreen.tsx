import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';

// Components
import { AppText, Label, Caption } from '../../components/common/AppText';
import { PremiumCard } from '../../components/common/GlassCard';
import { IconButton } from '../../components/common/AppButton';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, Layout, BorderRadius } from '../../theme/spacing';

// State & Services
import { useSubscriptionStore } from '../../state/client/subscriptionStore';
import { CurrencyService } from '../../services/currency.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = (SCREEN_WIDTH - Layout.screen.paddingHorizontal * 2 - Spacing['2'] * 6) / 7;

// ═══════════════════════════════════════════════════════════════
// CALENDAR SCREEN
// ═══════════════════════════════════════════════════════════════
export const CalendarScreen = () => {
  const { t } = useTranslation();
  const { subscriptions } = useSubscriptionStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  // Get renewals for current month
  const renewalsThisMonth = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    return (subscriptions || [])
      .filter(s => s.isActive && !s.isArchived)
      .filter(s => {
        const renewalDate = new Date(s.nextRenewalDate);
        return renewalDate >= monthStart && renewalDate <= monthEnd;
      })
      .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime());
  }, [subscriptions, currentDate]);

  // Get renewals for a specific date
  const getRenewalsForDate = (date: Date) => {
    return renewalsThisMonth.filter(s => isSameDay(new Date(s.nextRenewalDate), date));
  };

  // Get renewals for selected date
  const selectedDateRenewals = selectedDate ? getRenewalsForDate(selectedDate) : [];

  const totalThisMonth = renewalsThisMonth.reduce(
    (sum, s) => sum + (s.amount / (s.sharedWith || 1)), 
    0
  );

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const weekDays = [
    t('calendar.sun') || 'Sun',
    t('calendar.mon') || 'Mon',
    t('calendar.tue') || 'Tue',
    t('calendar.wed') || 'Wed',
    t('calendar.thu') || 'Thu',
    t('calendar.fri') || 'Fri',
    t('calendar.sat') || 'Sat'
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient background */}
      <View style={styles.ambientBg}>
        <LinearGradient
          colors={['rgba(212, 165, 116, 0.06)', 'transparent']}
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
          <View>
            <AppText variant="regular" size="sm" color={Colors.text.secondary} uppercase letterSpacing={2}>
              Renewal Schedule
            </AppText>
            <AppText variant="serifBold" size="3xl">Calendar</AppText>
          </View>
          <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
            <AppText variant="medium" size="sm" color={Colors.primary}>Today</AppText>
          </TouchableOpacity>
        </Animated.View>

        {/* Month Navigation */}
        <Animated.View 
          entering={FadeInDown.delay(150).springify()}
          style={styles.monthNav}
        >
          <IconButton icon="chevron-back" onPress={handlePrevMonth} variant="filled" size="sm" />
          <AppText variant="serifBold" size="2xl">{format(currentDate, 'MMMM yyyy')}</AppText>
          <IconButton icon="chevron-forward" onPress={handleNextMonth} variant="filled" size="sm" />
        </Animated.View>

        {/* Month Summary */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <PremiumCard variant="default" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Caption>Renewals</Caption>
                <AppText variant="serifBold" size="2xl">{renewalsThisMonth.length}</AppText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Caption>Total Due</Caption>
                <AppText variant="serifBold" size="2xl" color={Colors.primary}>
                  {CurrencyService.format(totalThisMonth)}
                </AppText>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Calendar Grid */}
        <Animated.View 
          entering={FadeInUp.delay(300).springify()}
          style={styles.calendarCard}
        >
          {/* Week headers */}
          <View style={styles.weekHeader}>
            {weekDays.map(day => (
              <View key={day} style={styles.weekDayCell}>
                <AppText variant="medium" size="xs" color={Colors.text.tertiary}>
                  {day}
                </AppText>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              const dayRenewals = getRenewalsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasRenewals = dayRenewals.length > 0;
              const isTodayDate = isToday(day);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isTodayDate && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDate(day)}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant={isSelected || isTodayDate ? 'semibold' : 'regular'}
                    size="base"
                    color={
                      !isCurrentMonth ? Colors.text.tertiary :
                      isSelected ? Colors.text.inverse :
                      isTodayDate ? Colors.primary :
                      Colors.text.primary
                    }
                  >
                    {format(day, 'd')}
                  </AppText>
                  
                  {hasRenewals && !isSelected && (
                    <View style={styles.renewalDots}>
                      {dayRenewals.slice(0, 3).map((_, i) => (
                        <View key={i} style={styles.renewalDot} />
                      ))}
                    </View>
                  )}
                  
                  {hasRenewals && isSelected && (
                    <AppText variant="medium" size="2xs" color={Colors.text.inverse}>
                      {dayRenewals.length}
                    </AppText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Selected Date Renewals */}
        {selectedDate && (
          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            style={styles.section}
          >
            <Label style={styles.sectionTitle}>
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
            </Label>

            {selectedDateRenewals.length > 0 ? (
              selectedDateRenewals.map((sub) => {
                const categoryColor = Colors.categories[
                  sub.category.toLowerCase() as keyof typeof Colors.categories
                ] || Colors.primary;

                return (
                  <PremiumCard key={sub.id} variant="default" style={styles.renewalCard}>
                    <View style={styles.renewalContent}>
                      <View style={[styles.renewalIndicator, { backgroundColor: categoryColor }]} />
                      <View style={styles.renewalInfo}>
                        <AppText variant="semibold" size="base">{sub.name}</AppText>
                        <AppText variant="regular" size="sm" color={Colors.text.tertiary}>
                          {sub.category} • {sub.billingCycle}
                        </AppText>
                      </View>
                      <View style={styles.renewalAmount}>
                        <AppText variant="serifBold" size="lg" color={Colors.primary}>
                          {CurrencyService.format(sub.amount / (sub.sharedWith || 1))}
                        </AppText>
                        {(sub.sharedWith || 1) > 1 && (
                          <Caption>of {CurrencyService.format(sub.amount)}</Caption>
                        )}
                      </View>
                    </View>
                  </PremiumCard>
                );
              })
            ) : (
              <PremiumCard variant="default" style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={32} color={Colors.text.tertiary} />
                <AppText 
                  variant="medium" 
                  size="sm" 
                  color={Colors.text.tertiary}
                  style={{ marginTop: Spacing['2'] }}
                >
                  No renewals on this day
                </AppText>
              </PremiumCard>
            )}
          </Animated.View>
        )}

        {/* Upcoming List */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Label style={styles.sectionTitle}>All Renewals This Month</Label>
          
          {renewalsThisMonth.length > 0 ? (
            renewalsThisMonth.map((sub, index) => {
              const categoryColor = Colors.categories[
                sub.category.toLowerCase() as keyof typeof Colors.categories
              ] || Colors.primary;
              const renewalDate = new Date(sub.nextRenewalDate);

              return (
                <View key={sub.id} style={styles.upcomingItem}>
                  <View style={styles.upcomingDate}>
                    <AppText variant="serifBold" size="lg" color={Colors.primary}>
                      {format(renewalDate, 'd')}
                    </AppText>
                    <Caption>{format(renewalDate, 'EEE')}</Caption>
                  </View>
                  
                  <View style={styles.upcomingLine}>
                    <View style={[styles.upcomingDot, { backgroundColor: categoryColor }]} />
                    {index < renewalsThisMonth.length - 1 && (
                      <View style={styles.upcomingConnector} />
                    )}
                  </View>
                  
                  <View style={styles.upcomingContent}>
                    <AppText variant="semibold" size="base">{sub.name}</AppText>
                    <Caption>{sub.category}</Caption>
                  </View>
                  
                  <AppText variant="serifMedium" size="base">
                    {CurrencyService.format(sub.amount / (sub.sharedWith || 1))}
                  </AppText>
                </View>
              );
            })
          ) : (
            <PremiumCard variant="default" style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={Colors.text.tertiary} />
              <AppText 
                variant="medium" 
                size="lg" 
                color={Colors.text.tertiary}
                style={{ marginTop: Spacing['3'] }}
              >
                No renewals this month
              </AppText>
              <Caption style={{ marginTop: Spacing['1'] }}>
                Add subscriptions to see their renewal dates
              </Caption>
            </PremiumCard>
          )}
        </Animated.View>

        <View style={{ height: Layout.screen.paddingBottom }} />
      </ScrollView>
    </SafeAreaView>
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
    height: 400,
  },
  scrollContent: {
    paddingHorizontal: Layout.screen.paddingHorizontal,
    paddingTop: Layout.screen.paddingTop,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing['4'],
  },
  todayButton: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['4'],
  },
  summaryCard: {
    marginBottom: Spacing['4'],
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing['4'],
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing['4'],
    marginBottom: Spacing['5'],
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: Spacing['2'],
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: Spacing['2'],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  renewalDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  renewalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  section: {
    marginBottom: Spacing['5'],
  },
  sectionTitle: {
    marginBottom: Spacing['3'],
  },
  renewalCard: {
    marginBottom: Spacing['2'],
  },
  renewalContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['8'],
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  upcomingDate: {
    width: 44,
    alignItems: 'center',
  },
  upcomingLine: {
    width: 24,
    alignItems: 'center',
  },
  upcomingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  upcomingConnector: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
  },
  upcomingContent: {
    flex: 1,
    marginLeft: Spacing['3'],
  },
});
