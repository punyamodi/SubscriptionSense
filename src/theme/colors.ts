/**
 * SubSync Design System - Themes
 */

export interface ThemeInterface {
  background: string;
  surface: string;
  surfaceLight: string;
  elevated: string;
  primary: string;
  primaryMuted: string;
  primarySubtle: string;
  accent: string;
  accentMuted: string;
  accentLight: string;
  copper: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    accent: string;
    link: string;
  };
  border: string;
  borderLight: string;
  borderAccent: string;
  divider: string;
  overlay: string;
  overlayLight: string;
  skeleton: string;
  skeletonShine: string;
  ripple: string;
  focus: string;
  categories: Record<string, string>;
  chart: {
    series: string[];
  };
  shadow: {
    color: string;
    opacity: number;
    offset: { width: number; height: number };
    radius: number;
  };
  gradient: {
    gold: readonly string[];
    goldSubtle: readonly string[];
    dark: readonly string[];
    card: readonly string[];
    premium: readonly string[];
  };
}

export const SharedColors = {
  categories: {
    streaming: '#E879F9',
    software: '#818CF8',
    utilities: '#F59E0B',
    health: '#34D399',
    education: '#A78BFA',
    finance: '#D4A574',
    lifestyle: '#FB923C',
    gaming: '#F472B6',
    music: '#22D3EE',
    food: '#FBBF24',
    shopping: '#F87171',
    transport: '#60A5FA',
    cloud: '#94A3B8',
    news: '#6366F1',
    other: '#8A8F98',
  },
  chart: {
    series: [
      '#D4A574', '#7EB8D6', '#7ECFA3', '#E8B86D', 
      '#E879F9', '#818CF8', '#34D399', '#F59E0B',
    ],
  },
  shadow: {
    color: '#000000',
    opacity: 0.5,
    offset: { width: 0, height: 4 },
    radius: 12,
  },
};

export const DarkTheme: ThemeInterface = {
  ...SharedColors,
  background: '#07080A',
  surface: '#0F1114',
  surfaceLight: '#181B20',
  elevated: '#22262D',
  primary: '#D4A574',
  primaryMuted: 'rgba(212, 165, 116, 0.15)',
  primarySubtle: 'rgba(212, 165, 116, 0.08)',
  accent: '#D4A574',
  accentMuted: 'rgba(212, 165, 116, 0.12)',
  accentLight: '#F5E6D3',
  copper: '#C7956D',
  success: '#7ECFA3',
  successMuted: 'rgba(126, 207, 163, 0.12)',
  warning: '#E8B86D',
  warningMuted: 'rgba(232, 184, 109, 0.12)',
  error: '#D97373',
  errorMuted: 'rgba(217, 115, 115, 0.12)',
  info: '#7EB8D6',
  infoMuted: 'rgba(126, 184, 214, 0.12)',
  text: {
    primary: '#F5F5F7',
    secondary: '#8A8F98',
    tertiary: '#4A4E56',
    inverse: '#07080A',
    accent: '#D4A574',
    link: '#7EB8D6',
  },
  border: '#1E2228',
  borderLight: '#2D333B',
  borderAccent: '#D4A574',
  divider: '#14171B',
  overlay: 'rgba(7, 8, 10, 0.85)',
  overlayLight: 'rgba(7, 8, 10, 0.6)',
  skeleton: '#181B20',
  skeletonShine: '#22262D',
  ripple: 'rgba(212, 165, 116, 0.15)',
  focus: 'rgba(212, 165, 116, 0.3)',
  gradient: {
    gold: ['#D4A574', '#C7956D', '#A67C52'] as const,
    goldSubtle: ['rgba(212, 165, 116, 0.2)', 'rgba(199, 149, 109, 0.05)'] as const,
    dark: ['#0F1114', '#07080A'] as const,
    card: ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)'] as const,
    premium: ['#D4A574', '#C7956D', '#A67C52'] as const,
  }
};

export const LightTheme: ThemeInterface = {
  ...SharedColors,
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#F1F3F5',
  elevated: '#E9ECEF',
  primary: '#B8860B', 
  primaryMuted: 'rgba(184, 134, 11, 0.1)',
  primarySubtle: 'rgba(184, 134, 11, 0.05)',
  accent: '#B8860B',
  accentMuted: 'rgba(184, 134, 11, 0.08)',
  accentLight: '#FFFBD1',
  copper: '#C7956D',
  success: '#2D8A5B',
  successMuted: 'rgba(45, 138, 91, 0.1)',
  warning: '#B58900',
  warningMuted: 'rgba(181, 137, 0, 0.1)',
  error: '#D32F2F',
  errorMuted: 'rgba(211, 47, 47, 0.1)',
  info: '#0277BD',
  infoMuted: 'rgba(2, 119, 189, 0.1)',
  text: {
    primary: '#1A1C1E',
    secondary: '#495057',
    tertiary: '#ADB5BD',
    inverse: '#FFFFFF',
    accent: '#B8860B',
    link: '#0277BD',
  },
  border: '#DEE2E6',
  borderLight: '#CED4DA',
  borderAccent: '#B8860B',
  divider: '#F1F3F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  skeleton: '#E9ECEF',
  skeletonShine: '#F8F9FA',
  ripple: 'rgba(0, 0, 0, 0.05)',
  focus: 'rgba(184, 134, 11, 0.2)',
  gradient: {
    gold: ['#B8860B', '#A67C00', '#8B6914'] as const,
    goldSubtle: ['rgba(184, 134, 11, 0.1)', 'rgba(184, 134, 11, 0.05)'] as const,
    dark: ['#F8F9FA', '#E9ECEF'] as const,
    card: ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.01)'] as const,
    premium: ['#B8860B', '#A67C00', '#8B6914'] as const,
  }
};

// Legacy Export for direct imports (default to Dark)
export const Colors = DarkTheme;
export const Categories = SharedColors.categories;

export type ThemeType = ThemeInterface;
