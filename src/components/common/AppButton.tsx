import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  interpolate,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { BorderRadius, Layout } from '../../theme/spacing';
import { Duration, Springs } from '../../theme/animations';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  animated = true,
  style,
}: AppButtonProps) => {
  const { colors, isDark } = useTheme();
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  // Size configurations
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { 
          height: Layout.button.heightSmall, 
          paddingHorizontal: 16, 
          fontSize: 13,
          iconSize: 16,
          borderRadius: BorderRadius.md,
        };
      case 'lg':
        return { 
          height: Layout.button.heightLarge, 
          paddingHorizontal: 28, 
          fontSize: 17,
          iconSize: 22,
          borderRadius: BorderRadius.lg,
        };
      default:
        return { 
          height: Layout.button.height, 
          paddingHorizontal: 24, 
          fontSize: 15,
          iconSize: 18,
          borderRadius: BorderRadius.DEFAULT,
        };
    }
  };

  // Variant configurations
  const getVariantConfig = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surfaceLight,
          borderColor: colors.border,
          borderWidth: 1,
          textColor: colors.text.primary,
          useGradient: false,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.borderLight,
          borderWidth: 1,
          textColor: colors.text.primary,
          useGradient: false,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.primary,
          useGradient: false,
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          borderWidth: 0,
          textColor: '#FFFFFF',
          useGradient: false,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.text.inverse,
          useGradient: true,
          gradientColors: ['#D4A574', '#C7956D', '#A67C52'] as const,
        };
      default: // primary
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 0,
          textColor: colors.text.inverse,
          useGradient: false,
        };
    }
  };

  const sizeConfig = getSizeConfig();
  const variantConfig = getVariantConfig();

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, 0.97]) },
      ],
    };
  });

  const handlePressIn = () => {
    if (animated && !isDisabled) {
      pressed.value = withSpring(1, Springs.quick);
    }
  };

  const handlePressOut = () => {
    if (animated) {
      pressed.value = withSpring(0, Springs.snappy);
    }
  };

  // Base button style
  const buttonStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    backgroundColor: variantConfig.backgroundColor,
    borderColor: variantConfig.borderColor,
    borderWidth: variantConfig.borderWidth,
    borderRadius: sizeConfig.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDisabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    overflow: 'hidden',
  };

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Ionicons 
        name={icon} 
        size={sizeConfig.iconSize} 
        color={variantConfig.textColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  // Render content
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={variantConfig.textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' && renderIcon()}
          <AppText
            variant="semibold"
            size={sizeConfig.fontSize}
            color={variantConfig.textColor}
            letterSpacing={0.5}
          >
            {title}
          </AppText>
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View style={[buttonStyle, animatedStyle, style]}>
        {variantConfig.useGradient && variantConfig.gradientColors && (
          <LinearGradient
            colors={variantConfig.gradientColors as unknown as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {renderContent()}
      </Animated.View>
    </Pressable>
  );
};

// ═══════════════════════════════════════════════════════════════
// ICON BUTTON - Compact circular button
// ═══════════════════════════════════════════════════════════════
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'accent';
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const IconButton = ({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  color,
  style,
}: IconButtonProps) => {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);

  const sizeMap = {
    sm: { button: 36, icon: 18 },
    md: { button: 44, icon: 22 },
    lg: { button: 52, icon: 26 },
  };

  const config = sizeMap[size];

  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled':
        return colors.surface;
      case 'accent':
        return colors.primary;
      default:
        return 'transparent';
    }
  };

  const getIconColor = () => {
    if (color) return color;
    if (disabled) return colors.text.tertiary;
    if (variant === 'accent') return colors.text.inverse;
    return colors.text.primary;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.9]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.8]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { pressed.value = withTiming(1, { duration: Duration.press }); }}
      onPressOut={() => { pressed.value = withTiming(0, { duration: Duration.fast }); }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            width: config.button,
            height: config.button,
            borderRadius: config.button / 2,
            backgroundColor: getBackgroundColor(),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
          style,
        ]}
      >
        <Ionicons name={icon} size={config.icon} color={getIconColor()} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
