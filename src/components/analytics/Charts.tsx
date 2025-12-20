import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G, Text as SvgText, Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppText } from '../common/AppText';
import { BorderRadius, Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
// DONUT CHART - Category breakdown visualization
// ═══════════════════════════════════════════════════════════════
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const DonutChart = ({
  data,
  size = 180,
  strokeWidth = 24,
  centerLabel,
  centerValue,
  animated = true,
  style,
}: DonutChartProps) => {
  const animValue = useSharedValue(0);
  const safeData = data || [];
  const total = safeData.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      animValue.value = withDelay(200, withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      }));
    } else {
      animValue.value = 1;
    }
  }, []);

  let cumulativePercent = 0;

  return (
    <View style={[styles.donutContainer, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.surface}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Data segments */}
          {safeData.map((segment, index) => {
            const percent = segment.value / total;
            const offset = circumference * cumulativePercent;
            const strokeDasharray = `${circumference * percent} ${circumference}`;
            cumulativePercent += percent;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth - 4}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                fill="transparent"
              />
            );
          })}
        </G>
      </Svg>

      {/* Center content */}
      {(centerLabel || centerValue) && (
        <View style={styles.donutCenter}>
          {centerValue && (
            <AppText variant="serifBold" size="2xl" color={Colors.text.primary}>
              {centerValue}
            </AppText>
          )}
          {centerLabel && (
            <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
              {centerLabel}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS RING - Single metric ring
// ═══════════════════════════════════════════════════════════════
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = Colors.primary,
  backgroundColor = Colors.surface,
  label,
  value,
  animated = true,
  style,
}: ProgressRingProps) => {
  const animValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress / 100);

  useEffect(() => {
    if (animated) {
      animValue.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animValue.value,
    transform: [{ scale: interpolate(animValue.value, [0, 1], [0.9, 1]) }],
  }));

  return (
    <Animated.View style={[styles.ringContainer, { width: size, height: size }, animatedStyle, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      <View style={styles.ringCenter}>
        {value && (
          <AppText variant="bold" size="base" color={color}>
            {value}
          </AppText>
        )}
        {label && (
          <AppText variant="regular" size="2xs" color={Colors.text.tertiary}>
            {label}
          </AppText>
        )}
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// BAR CHART - Horizontal category bars
// ═══════════════════════════════════════════════════════════════
interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  formatValue?: (value: number) => string;
  animated?: boolean;
  style?: ViewStyle;
}

export const BarChart = ({
  data,
  formatValue = (v) => v.toString(),
  animated = true,
  style,
}: BarChartProps) => {
  const safeData = data || [];
  const maxValue = Math.max(...safeData.map(d => d.value), 1);

  return (
    <View style={[styles.barChartContainer, style]}>
      {safeData.map((item, index) => (
        <BarChartRow
          key={item.label}
          label={item.label}
          value={item.value}
          maxValue={maxValue}
          color={item.color}
          formattedValue={formatValue(item.value)}
          delay={animated ? index * 50 : 0}
        />
      ))}
    </View>
  );
};

interface BarChartRowProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  formattedValue: string;
  delay: number;
}

const BarChartRow = ({ 
  label, 
  value, 
  maxValue, 
  color, 
  formattedValue, 
  delay 
}: BarChartRowProps) => {
  const widthAnim = useSharedValue(0);
  const percent = (value / maxValue) * 100;

  useEffect(() => {
    widthAnim.value = withDelay(delay, withSpring(percent, { damping: 20, stiffness: 90 }));
  }, []);

  const barAnimStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelContainer}>
        <View style={[styles.barDot, { backgroundColor: color }]} />
        <AppText variant="medium" size="sm" numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </AppText>
      </View>
      
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <Animated.View style={[styles.barFill, { backgroundColor: color }, barAnimStyle]} />
        </View>
      </View>
      
      <AppText variant="semibold" size="sm" style={styles.barValue}>
        {formattedValue}
      </AppText>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// SPARKLINE - Mini trend line
// ═══════════════════════════════════════════════════════════════
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  style?: ViewStyle;
}

export const Sparkline = ({
  data,
  width = 100,
  height = 32,
  color = Colors.primary,
  showArea = true,
  style,
}: SparklineProps) => {
  const safeData = data || [];
  if (safeData.length < 2) return null;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;

  const points = safeData.map((value, index) => ({
    x: padding + (index / (safeData.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - min) / range) * chartHeight,
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height}>
        {showArea && (
          <Path d={areaPath} fill={`${color}15`} />
        )}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={2}
          fill="transparent"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Donut Chart
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress Ring
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bar Chart
  barChartContainer: {
    gap: Spacing['4'],
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabelContainer: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing['2'],
  },
  barContainer: {
    flex: 1,
    marginHorizontal: Spacing['3'],
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    width: 70,
    textAlign: 'right',
  },
});
