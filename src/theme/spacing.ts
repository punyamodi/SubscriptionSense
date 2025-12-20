/**
 * SubSync Spacing & Layout System
 * Consistent spacing scale based on 4px base unit
 */

// ═══════════════════════════════════════════════════════════════
// SPACING SCALE - 4px Base
// ═══════════════════════════════════════════════════════════════
export const Spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
} as const;

// ═══════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  DEFAULT: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════
// ICON SIZES
// ═══════════════════════════════════════════════════════════════
export const IconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ═══════════════════════════════════════════════════════════════
// HIT SLOP (for touch targets)
// ═══════════════════════════════════════════════════════════════
export const HitSlop = {
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 },
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT DIMENSIONS
// ═══════════════════════════════════════════════════════════════
export const Layout = {
  screen: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Space for tab bar
  },
  card: {
    padding: 20,
    paddingSmall: 16,
    paddingLarge: 24,
  },
  header: {
    height: 56,
    heightLarge: 72,
  },
  tabBar: {
    height: 80,
    iconSize: 24,
    indicatorWidth: 48,
  },
  button: {
    heightSmall: 40,
    height: 48,
    heightLarge: 56,
  },
  input: {
    height: 52,
    heightSmall: 44,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  badge: {
    dot: 8,
    small: 18,
    medium: 24,
    large: 32,
  },
} as const;

export type SpacingToken = keyof typeof Spacing;
export type BorderRadiusToken = keyof typeof BorderRadius;
