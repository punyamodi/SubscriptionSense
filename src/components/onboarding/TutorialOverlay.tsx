import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { AppText } from '../common/AppText';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { usePreferencesStore } from '../../state/client/preferencesStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tutorial step definitions
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  position?: 'top' | 'center' | 'bottom';
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SubSync! 👋',
    description: 'Let\'s take a quick tour to help you get started with managing your subscriptions.',
    icon: 'sparkles',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your home base. See your total monthly spending, upcoming renewals, and quick insights at a glance.',
    icon: 'home',
    position: 'top',
  },
  {
    id: 'add-subscription',
    title: 'Add Subscriptions',
    description: 'Tap the + button to add your subscriptions. You can choose from popular services or add custom ones.',
    icon: 'add-circle',
    position: 'bottom',
  },
  {
    id: 'subscriptions-list',
    title: 'Manage Subscriptions',
    description: 'View all your subscriptions in one place. Swipe left to edit or archive, and tap for details.',
    icon: 'list',
    position: 'center',
  },
  {
    id: 'analytics',
    title: 'Track Your Spending',
    description: 'See detailed analytics with charts showing where your money goes. Set budgets and track progress.',
    icon: 'analytics',
    position: 'center',
  },
  {
    id: 'calendar',
    title: 'Never Miss a Renewal',
    description: 'The calendar shows upcoming renewals. Enable notifications to get reminders before charges.',
    icon: 'calendar',
    position: 'center',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Change currency, language, enable dark mode, and sync your data across devices from Settings.',
    icon: 'settings',
    position: 'center',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start by adding your first subscription. You can replay this tutorial anytime from Settings.',
    icon: 'checkmark-circle',
    position: 'center',
  },
];

interface TutorialOverlayProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  visible,
  onComplete,
  onSkip,
}) => {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, currentStep]);

  const animateToNextStep = (forward: boolean) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: forward ? -50 : 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(prev => forward ? prev + 1 : prev - 1);
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      animateToNextStep(true);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      animateToNextStep(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getPositionStyle = () => {
    switch (step.position) {
      case 'top':
        return { justifyContent: 'flex-start', paddingTop: 120 };
      case 'bottom':
        return { justifyContent: 'flex-end', paddingBottom: 150 };
      default:
        return { justifyContent: 'center' };
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]}>
        {/* Skip button */}
        {!isLastStep && (
          <TouchableOpacity 
            style={[styles.skipButton, { backgroundColor: colors.surface }]}
            onPress={handleSkip}
          >
            <AppText variant="medium" size="sm" color={colors.text.secondary}>
              Skip Tour
            </AppText>
          </TouchableOpacity>
        )}

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep 
                    ? colors.primary 
                    : index < currentStep 
                      ? colors.primaryMuted 
                      : colors.border,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={[styles.contentContainer, getPositionStyle() as any]}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Icon */}
            <Animated.View 
              style={[
                styles.iconContainer,
                { 
                  backgroundColor: colors.primaryMuted,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={colors.gradient.premium as unknown as [string, string, ...string[]]}
                style={styles.iconGradient}
              >
                <Ionicons name={step.icon} size={36} color={colors.text.inverse} />
              </LinearGradient>
            </Animated.View>

            {/* Text */}
            <AppText 
              variant="serifBold" 
              size="2xl" 
              align="center"
              style={styles.title}
            >
              {step.title}
            </AppText>
            
            <AppText 
              variant="regular" 
              size="base" 
              color={colors.text.secondary}
              align="center"
              style={styles.description}
            >
              {step.description}
            </AppText>

            {/* Step indicator */}
            <AppText 
              variant="medium" 
              size="sm" 
              color={colors.text.tertiary}
              align="center"
              style={styles.stepIndicator}
            >
              {currentStep + 1} of {TUTORIAL_STEPS.length}
            </AppText>
          </Animated.View>

          {/* Navigation buttons */}
          <View style={styles.buttonsContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.backButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
                <AppText variant="medium" size="base" color={colors.text.primary}>
                  Back
                </AppText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                { flex: isFirstStep ? 1 : undefined },
              ]}
              onPress={handleNext}
            >
              <LinearGradient
                colors={colors.gradient.premium as unknown as [string, string, ...string[]]}
                style={styles.nextButtonGradient}
              >
                <AppText variant="semibold" size="base" color={colors.text.inverse}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </AppText>
                {!isLastStep && (
                  <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature previews for certain steps */}
        {step.id === 'add-subscription' && (
          <Animated.View 
            style={[
              styles.featurePreview,
              { 
                opacity: fadeAnim,
                bottom: 280,
              }
            ]}
          >
            <View style={[styles.fabPreview, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={32} color={colors.text.inverse} />
            </View>
          </Animated.View>
        )}

        {step.id === 'subscriptions-list' && (
          <Animated.View 
            style={[
              styles.featurePreview,
              { 
                opacity: fadeAnim,
                top: 150,
              }
            ]}
          >
            <View style={[styles.cardPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.previewIcon, { backgroundColor: '#E879F9' }]}>
                <Ionicons name="play-circle" size={20} color="#FFF" />
              </View>
              <View style={styles.previewText}>
                <View style={[styles.previewLine, { backgroundColor: colors.text.primary, width: 80 }]} />
                <View style={[styles.previewLine, { backgroundColor: colors.text.tertiary, width: 50 }]} />
              </View>
              <AppText variant="semibold" size="base" color={colors.success}>$15.99</AppText>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

// Hook to manage tutorial state
export const useTutorial = () => {
  const { hasCompletedTutorial, setHasCompletedTutorial } = usePreferencesStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show tutorial if not completed
    if (!hasCompletedTutorial) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial]);

  const completeTutorial = () => {
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  };

  const restartTutorial = () => {
    setShowTutorial(true);
  };

  return {
    showTutorial,
    completeTutorial,
    skipTutorial,
    restartTutorial,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: Spacing['6'],
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['2'],
    borderRadius: BorderRadius.full,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing['2'],
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    padding: Spacing['6'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing['5'],
    borderRadius: BorderRadius.xl,
    padding: 4,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: Spacing['3'],
  },
  description: {
    lineHeight: 24,
    marginBottom: Spacing['4'],
  },
  stepIndicator: {
    marginTop: Spacing['2'],
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing['3'],
    marginTop: Spacing['6'],
  },
  navButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    paddingVertical: Spacing['4'],
    borderWidth: 1,
  },
  nextButton: {},
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    paddingVertical: Spacing['4'],
  },
  featurePreview: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fabPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    width: SCREEN_WIDTH - 80,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing['3'],
  },
  previewText: {
    flex: 1,
    gap: 6,
  },
  previewLine: {
    height: 10,
    borderRadius: 5,
  },
});

export default TutorialOverlay;
