/**
 * SubSync Typography System - "Obsidian Finance"
 * 
 * ═══════════════════════════════════════════════════════════════
 * Font Pairing Strategy:
 * 
 * SPECTRAL (Serif) - Financial sophistication, headlines, amounts
 *   → Conveys trust, authority, editorial quality
 *   → Used for: Page titles, currency amounts, hero numbers
 * 
 * OUTFIT (Geometric Sans) - Modern, clean, highly legible
 *   → Contemporary tech feel, accessibility-focused
 *   → Used for: Body text, labels, buttons, navigation
 * 
 * Future: JetBrains Mono - Mono for numbers (if needed)
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// FONT FAMILIES
// ═══════════════════════════════════════════════════════════════
export const Fonts = {
  // Geometric Sans - UI Text (Outfit family)
  SansRegular: 'Outfit_400Regular',
  SansMedium: 'Outfit_500Medium',
  SansSemiBold: 'Outfit_600SemiBold',
  SansBold: 'Outfit_700Bold',
  SansBlack: 'Outfit_800ExtraBold',

  // Serif - Display & Financial (Spectral family)
  SerifLight: 'Spectral_300Light',
  SerifRegular: 'Spectral_400Regular',
  SerifMedium: 'Spectral_500Medium',
  SerifSemiBold: 'Spectral_600SemiBold',
  SerifBold: 'Spectral_700Bold',
} as const;

// ═══════════════════════════════════════════════════════════════
// FONT SIZE SCALE - Perfect Fourth (1.333)
// Base: 15px / 1rem
// ═══════════════════════════════════════════════════════════════
export const FontSizes = {
  // Micro - Labels, captions
  '2xs': 9,
  xs: 11,
  sm: 13,
  
  // Body - Standard text
  base: 15,
  md: 17,
  
  // Headings
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  
  // Display - Hero elements
  '4xl': 42,
  '5xl': 56,
  '6xl': 72,
  '7xl': 96,
} as const;

// ═══════════════════════════════════════════════════════════════
// LINE HEIGHT SCALE
// ═══════════════════════════════════════════════════════════════
export const LineHeights = {
  none: 1,
  tight: 1.1,      // Headlines, display
  snug: 1.25,      // Subheadings
  normal: 1.4,     // Body text
  relaxed: 1.6,    // Long-form reading
  loose: 1.8,      // Spacious paragraphs
} as const;

// ═══════════════════════════════════════════════════════════════
// LETTER SPACING
// ═══════════════════════════════════════════════════════════════
export const LetterSpacing = {
  tightest: -1,    // Display headlines
  tighter: -0.5,   // Large numbers
  tight: -0.25,    // Headlines
  normal: 0,       // Body
  wide: 0.5,       // Small caps
  wider: 1,        // Uppercase labels
  widest: 2,       // All-caps tracking
  spread: 3,       // Extreme tracking
} as const;

// ═══════════════════════════════════════════════════════════════
// TEXT STYLES - Semantic Presets
// ═══════════════════════════════════════════════════════════════
export const TextStyles = {
  // Display - Hero elements
  displayXL: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['6xl'],
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tighter,
  },
  displayLG: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['5xl'],
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  displayMD: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['4xl'],
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  // Headlines
  h1: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['3xl'],
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: Fonts.SerifMedium,
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily: Fonts.SansBold,
    fontSize: FontSizes.xl,
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontFamily: Fonts.SansSemiBold,
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Body text
  bodyLG: {
    fontFamily: Fonts.SansRegular,
    fontSize: FontSizes.md,
    lineHeight: LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  body: {
    fontFamily: Fonts.SansRegular,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  bodySM: {
    fontFamily: Fonts.SansRegular,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Currency & Numbers - Serif for elegance
  currency: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['5xl'],
    lineHeight: LineHeights.none,
    letterSpacing: LetterSpacing.tighter,
  },
  currencyMD: {
    fontFamily: Fonts.SerifBold,
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  currencySM: {
    fontFamily: Fonts.SerifMedium,
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  // Labels - Uppercase tracking
  label: {
    fontFamily: Fonts.SansSemiBold,
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  labelSM: {
    fontFamily: Fonts.SansMedium,
    fontSize: FontSizes['2xs'],
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  
  // Buttons
  buttonLG: {
    fontFamily: Fonts.SansSemiBold,
    fontSize: FontSizes.md,
    lineHeight: LineHeights.none,
    letterSpacing: LetterSpacing.wide,
  },
  button: {
    fontFamily: Fonts.SansSemiBold,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.none,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSM: {
    fontFamily: Fonts.SansMedium,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.none,
    letterSpacing: LetterSpacing.wide,
  },
  
  // Captions & Hints
  caption: {
    fontFamily: Fonts.SansRegular,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  captionSM: {
    fontFamily: Fonts.SansRegular,
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// TYPE ALIASES for Quick Access
// ═══════════════════════════════════════════════════════════════
export type FontFamily = keyof typeof Fonts;
export type FontSizeToken = keyof typeof FontSizes;
export type LineHeightToken = keyof typeof LineHeights;
export type LetterSpacingToken = keyof typeof LetterSpacing;
export type TextStyleToken = keyof typeof TextStyles;
