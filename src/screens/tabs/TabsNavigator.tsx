import React from 'react';
import { View, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Screens
import { DashboardScreen } from './DashboardScreen';
import { SubscriptionListScreen } from './SubscriptionListScreen';
import { CalendarScreen } from './CalendarScreen';
import { AnalyticsScreen } from './AnalyticsScreen';
import { SettingsScreen } from './SettingsScreen';

// Theme
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Layout } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { AppText } from '../../components/common/AppText';

const Tab = createBottomTabNavigator();

// ═══════════════════════════════════════════════════════════════
// TAB CONFIGURATION
// ═══════════════════════════════════════════════════════════════
type TabConfig = {
  name: string;
  component: React.ComponentType;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  labelKey: string;
};

const TAB_CONFIGS: TabConfig[] = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'grid-outline', iconFocused: 'grid', labelKey: 'tabs.home' },
  { name: 'Ledger', component: SubscriptionListScreen, icon: 'receipt-outline', iconFocused: 'receipt', labelKey: 'tabs.subs' },
  { name: 'Calendar', component: CalendarScreen, icon: 'calendar-outline', iconFocused: 'calendar', labelKey: 'tabs.calendar' },
  { name: 'Analytics', component: AnalyticsScreen, icon: 'stats-chart-outline', iconFocused: 'stats-chart', labelKey: 'tabs.insights' },
  { name: 'Settings', component: SettingsScreen, icon: 'settings-outline', iconFocused: 'settings', labelKey: 'tabs.settings' },
];

// ═══════════════════════════════════════════════════════════════
// ANIMATED TAB BUTTON
// ═══════════════════════════════════════════════════════════════
const AnimatedTabButton = ({ isFocused, icon, iconFocused, label, onPress, onLongPress }: any) => {
  const scale = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, Springs.snappy);
  }, [isFocused]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [{ scale: interpolate(scale.value, [0, 1], [0.5, 1]) }, { translateY: interpolate(scale.value, [0, 1], [4, 0]) }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.1]) }],
  }));

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.tabButton} activeOpacity={0.7}>
      <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
      <Animated.View style={iconContainerStyle}>
        <Ionicons name={isFocused ? iconFocused : icon} size={22} color={isFocused ? Colors.primary : Colors.text.tertiary} />
      </Animated.View>
      <AppText variant={isFocused ? 'medium' : 'regular'} size="2xs" color={isFocused ? Colors.primary : Colors.text.tertiary} style={styles.tabLabel}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════
// CUSTOM TAB BAR
// ═══════════════════════════════════════════════════════════════
const CustomTabBar = ({ state, descriptors, navigation, t }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarGradient} />
      <View style={styles.tabButtonsContainer}>
        {(state?.routes || []).map((route: any, index: number) => {
          const tabConfig = TAB_CONFIGS.find(t => t.name === route.name);
          const isFocused = state.index === index;
          if (!tabConfig) return null;

          return (
            <AnimatedTabButton
              key={route.key}
              isFocused={isFocused}
              icon={tabConfig.icon}
              iconFocused={tabConfig.iconFocused}
              label={t(tabConfig.labelKey)}
              onPress={() => navigation.navigate(route.name)}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
};

import { TutorialOverlay, useTutorial } from '../../components/onboarding/TutorialOverlay';

// ═══════════════════════════════════════════════════════════════
// TABS NAVIGATOR
// ═══════════════════════════════════════════════════════════════
export const TabsNavigator = () => {
  const { t } = useTranslation();
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} t={t} />}
        screenOptions={{ headerShown: false }}
      >
        {TAB_CONFIGS.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>

      {/* Tutorial Overlay for new users */}
      <TutorialOverlay
        visible={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 8, 10, 0.85)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    overflow: 'hidden',
  },
  tabBarGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 17, 20, 0.6)' },
  tabButtonsContainer: { flexDirection: 'row', paddingTop: Spacing['2'], paddingHorizontal: Spacing['2'] },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing['2'], position: 'relative' },
  activeIndicator: { position: 'absolute', top: 0, width: 20, height: 3, borderRadius: 2, backgroundColor: Colors.primary },
  tabLabel: { marginTop: 4 },
});

export default TabsNavigator;
