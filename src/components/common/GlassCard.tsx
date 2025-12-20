import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { Duration, Easings } from '../../theme/animations';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type CardVariant = 'default' | 'elevated' | 'accent' | 'gradient' | 'glass' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  padding?: CardPadding;
  borderRadius?: number;
  onPress?: () => void;
  animated?: boolean;
  glow?: boolean;
  noBorder?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const PADDING_MAP: Record<CardPadding, number> = {
  none: 0,
  sm: Spacing['3'],
  md: Spacing['4'],
  lg: Spacing['5'],
  xl: Spacing['6'],
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export const PremiumCard = ({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  borderRadius = BorderRadius.lg,
  onPress,
  animated = true,
  glow = false,
  noBorder = false,
}: PremiumCardProps) => {
  const { colors, isDark } = useTheme();
  const pressed = useSharedValue(0);

  const getVariantStyles = (): {
    backgroundColor: string;
    borderColor: string;
    gradientColors?: readonly string[];
  } => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.elevated,
          borderColor: colors.borderLight,
        };
      case 'accent':
        return {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primary,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          gradientColors: isDark 
            ? ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)'] as const
            : ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.01)'] as const,
        };
      case 'glass':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.borderLight,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = PADDING_MAP[padding];

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || !onPress) return {};
    
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, 0.98]) },
      ],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
    };
  });

  const handlePressIn = () => {
    if (animated && onPress) {
      pressed.value = withTiming(1, { duration: Duration.press });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      pressed.value = withTiming(0, { duration: Duration.normal });
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius,
    borderWidth: noBorder ? 0 : 1,
    borderColor: variantStyles.borderColor,
    backgroundColor: variantStyles.backgroundColor,
    padding: paddingValue,
    overflow: 'hidden',
  };

  const content = (
    <Animated.View style={[cardStyle, animatedStyle, style]}>
      {glow && (
        <View style={[styles.glow, { borderRadius }]}>
          <LinearGradient
            colors={['rgba(212, 165, 116, 0.2)', 'rgba(199, 149, 109, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      {variant === 'gradient' && variantStyles.gradientColors && (
        <LinearGradient
          colors={variantStyles.gradientColors as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export const GlassCard = ({
  noPadding,
  ...props
}: Omit<PremiumCardProps, 'padding'> & { noPadding?: boolean }) => (
  <PremiumCard 
    padding={noPadding ? 'none' : 'lg'} 
    {...props} 
  />
);

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
});
