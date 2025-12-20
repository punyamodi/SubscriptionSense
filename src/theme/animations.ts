/**
 * SubSync Animation System
 * Consistent motion design tokens for React Native Reanimated
 */

import { Easing } from 'react-native-reanimated';

// ═══════════════════════════════════════════════════════════════
// DURATION SCALE (in milliseconds)
// ═══════════════════════════════════════════════════════════════
export const Duration = {
  instant: 0,
  fastest: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 700,
  
  // Semantic durations
  enter: 250,
  exit: 200,
  hover: 150,
  press: 100,
  page: 350,
  modal: 300,
} as const;

// ═══════════════════════════════════════════════════════════════
// EASING CURVES
// ═══════════════════════════════════════════════════════════════
export const Easings = {
  // Standard curves
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Cubic beziers
  gentle: Easing.bezier(0.4, 0, 0.2, 1),      // Material standard
  snappy: Easing.bezier(0.4, 0, 0, 1),        // Quick, responsive
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Overshoot
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),  // Smooth decelerate
  
  // Entrance/Exit
  enter: Easing.bezier(0, 0, 0.2, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
  
  // Spring-like
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

// ═══════════════════════════════════════════════════════════════
// SPRING CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════
export const Springs = {
  // Gentle, smooth animations
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  
  // Snappy, responsive
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.5,
  },
  
  // Bouncy, playful
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.8,
  },
  
  // Heavy, dramatic
  heavy: {
    damping: 25,
    stiffness: 80,
    mass: 1.5,
  },
  
  // Quick micro-interactions
  quick: {
    damping: 20,
    stiffness: 300,
    mass: 0.3,
  },
  
  // Smooth page transitions
  page: {
    damping: 22,
    stiffness: 150,
    mass: 0.9,
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// STAGGER DELAYS
// ═══════════════════════════════════════════════════════════════
export const Stagger = {
  fast: 30,
  normal: 50,
  slow: 80,
  
  // Gets delay for nth item
  getDelay: (index: number, interval: number = 50) => index * interval,
} as const;

// ═══════════════════════════════════════════════════════════════
// COMMON ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════
export const AnimationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: Duration.enter,
    easing: Easings.enter,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: Duration.exit,
    easing: Easings.exit,
  },
  slideUp: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: Duration.enter,
    easing: Easings.gentle,
  },
  slideDown: {
    from: { translateY: -20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: Duration.enter,
    easing: Easings.gentle,
  },
  scaleIn: {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: Duration.enter,
    easing: Easings.snappy,
  },
  press: {
    from: { scale: 1 },
    to: { scale: 0.97 },
    duration: Duration.press,
    easing: Easings.snappy,
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// REDUCED MOTION SUPPORT
// ═══════════════════════════════════════════════════════════════
export const getReducedMotionDuration = (duration: number): number => {
  // Return minimal duration for reduced motion preference
  return duration > 0 ? 1 : 0;
};

export type DurationToken = keyof typeof Duration;
export type EasingToken = keyof typeof Easings;
export type SpringToken = keyof typeof Springs;
