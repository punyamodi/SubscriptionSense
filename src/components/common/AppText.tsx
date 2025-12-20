import React from 'react';
import { Text, TextStyle, TextProps, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Fonts, FontSizes, LetterSpacing } from '../../theme/typography';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type FontVariant = 
  | 'regular' | 'medium' | 'semibold' | 'bold' | 'black'
  | 'serifLight' | 'serifRegular' | 'serifMedium' | 'serifSemiBold' | 'serifBold';

type FontSize = keyof typeof FontSizes | number;

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: FontVariant;
  size?: FontSize;
  color?: string;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  opacity?: number;
  animated?: boolean;
  style?: TextStyle | TextStyle[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export const AppText = ({
  children,
  variant = 'regular',
  size = 'base',
  color,
  align = 'left',
  uppercase = false,
  letterSpacing,
  lineHeight,
  opacity,
  animated = false,
  style,
  ...props
}: AppTextProps) => {
  const { colors } = useTheme();
  
  // Resolve font color
  const textColor = color || colors.text.primary;
  
  // Get font family based on variant
  const getFontFamily = (): string => {
    const fontMap: Record<FontVariant, string> = {
      regular: Fonts.SansRegular,
      medium: Fonts.SansMedium,
      semibold: Fonts.SansSemiBold,
      bold: Fonts.SansBold,
      black: Fonts.SansBlack,
      serifLight: Fonts.SerifLight,
      serifRegular: Fonts.SerifRegular,
      serifMedium: Fonts.SerifMedium,
      serifSemiBold: Fonts.SerifSemiBold,
      serifBold: Fonts.SerifBold,
    };
    return fontMap[variant] || Fonts.SansRegular;
  };

  // Resolve font size
  const fontSize = typeof size === 'number' ? size : FontSizes[size];

  // Calculate letter spacing
  const getLetterSpacing = (): number => {
    if (letterSpacing !== undefined) return letterSpacing;
    if (uppercase) return LetterSpacing.widest;
    // Tighter tracking for larger serif text
    if (variant.startsWith('serif') && fontSize >= FontSizes['2xl']) {
      return LetterSpacing.tight;
    }
    return LetterSpacing.normal;
  };

  // Build text style
  const textStyle: TextStyle = {
    fontFamily: getFontFamily(),
    fontSize,
    color: textColor,
    textAlign: align,
    textTransform: uppercase ? 'uppercase' : 'none',
    letterSpacing: getLetterSpacing(),
    lineHeight: lineHeight ? fontSize * lineHeight : undefined,
    opacity: opacity,
  };

  // Return animated or regular text
  const TextComponent = animated ? Animated.Text : Text;

  return (
    <TextComponent style={[textStyle, style]} {...props}>
      {children}
    </TextComponent>
  );
};

// ═══════════════════════════════════════════════════════════════
// SEMANTIC TEXT VARIANTS
// Pre-styled text components for common use cases
// ═══════════════════════════════════════════════════════════════

interface SimpleTextProps extends Omit<AppTextProps, 'variant' | 'size'> {
  children: React.ReactNode;
}

// Display / Hero Text
export const DisplayText = (props: SimpleTextProps) => (
  <AppText variant="serifBold" size="5xl" lineHeight={1.1} {...props} />
);

export const DisplayMD = (props: SimpleTextProps) => (
  <AppText variant="serifBold" size="4xl" lineHeight={1.1} {...props} />
);

// Page Headlines
export const H1 = (props: SimpleTextProps) => (
  <AppText variant="serifBold" size="3xl" lineHeight={1.2} {...props} />
);

export const H2 = (props: SimpleTextProps) => (
  <AppText variant="serifMedium" size="2xl" lineHeight={1.25} {...props} />
);

export const H3 = (props: SimpleTextProps) => (
  <AppText variant="bold" size="xl" {...props} />
);

export const H4 = (props: SimpleTextProps) => (
  <AppText variant="semibold" size="lg" {...props} />
);

// Currency / Numbers
export const CurrencyText = (props: SimpleTextProps) => (
  <AppText variant="serifBold" size="5xl" lineHeight={1} {...props} />
);

export const CurrencyMD = (props: SimpleTextProps) => (
  <AppText variant="serifBold" size="2xl" {...props} />
);

export const CurrencySM = (props: SimpleTextProps) => (
  <AppText variant="serifMedium" size="lg" {...props} />
);

// Body Text
export const Body = (props: SimpleTextProps) => {
  const { colors } = useTheme();
  return <AppText variant="regular" size="base" color={props.color || colors.text.secondary} {...props} />;
};

export const BodySM = (props: SimpleTextProps) => {
  const { colors } = useTheme();
  return <AppText variant="regular" size="sm" color={props.color || colors.text.secondary} {...props} />;
};

// Labels
export const Label = (props: SimpleTextProps) => {
  const { colors } = useTheme();
  return (
    <AppText 
      variant="semibold" 
      size="xs" 
      color={props.color || colors.text.secondary} 
      uppercase 
      letterSpacing={2}
      {...props} 
    />
  );
};

// Caption / Hints
export const Caption = (props: SimpleTextProps) => {
  const { colors } = useTheme();
  return <AppText variant="regular" size="sm" color={props.color || colors.text.tertiary} {...props} />;
};

export const CaptionSM = (props: SimpleTextProps) => {
  const { colors } = useTheme();
  return <AppText variant="regular" size="xs" color={props.color || colors.text.tertiary} {...props} />;
};
