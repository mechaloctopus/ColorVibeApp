// Comprehensive Design System for Visual Consistency
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Color Palette
export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Accent Colors
  accent: {
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    cyan: '#06b6d4',
  },
  
  // Semantic Colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Dark Mode Colors
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    border: '#475569',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
  },
  
  // Light Mode Colors
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
    },
  },

  // Background Colors (for component compatibility)
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f3f4',
    dark: '#1a1a1a',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text Colors (for component compatibility)
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    tertiary: '#64748b',
    inverse: '#ffffff',
    disabled: '#94a3b8',
  },

  // Border Colors (for component compatibility)
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
    focus: '#3b82f6',
  },
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Font Families
  fontFamily: {
    sans: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Text Style Presets (for component compatibility)
  h1: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 1.25,
  },
  h2: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 1.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 1.375,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 1.375,
  },
  h5: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 1.375,
  },
  h6: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 1.375,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.375,
  },
  button: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 1.25,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.375,
  },
} as const;

// Spacing Scale (based on 4px grid)
export const SPACING = {
  // Numeric spacing
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,

  // Named spacing (for component compatibility)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
} as const;

// Border Radius Scale
export const BORDER_RADIUS = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Shadow Presets
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 15,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },

  // Component compatibility aliases
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Layout Constants
export const LAYOUT = {
  // Screen dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Safe areas (approximate)
  safeArea: {
    top: Platform.select({ ios: 44, android: 24, default: 24 }),
    bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  },
  
  // Common component sizes
  header: {
    height: 60,
  },
  
  tabBar: {
    height: 80,
  },
  
  // Touch targets
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
  
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// Component Style Presets
export const COMPONENT_STYLES = {
  // Button variants
  button: {
    primary: {
      backgroundColor: COLORS.primary[500],
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING[6],
      paddingVertical: SPACING[3],
      ...SHADOWS.base,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.primary[500],
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING[6],
      paddingVertical: SPACING[3],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING[6],
      paddingVertical: SPACING[3],
    },
  },
  
  // Card variants
  card: {
    base: {
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING[4],
      ...SHADOWS.base,
    },
    elevated: {
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING[6],
      ...SHADOWS.lg,
    },
  },
  
  // Input variants
  input: {
    base: {
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.base,
    },
  },
} as const;

// Theme Configuration
export interface Theme {
  colors: typeof COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  animation: typeof ANIMATION;
  layout: typeof LAYOUT;
  components: typeof COMPONENT_STYLES;
  isDark: boolean;
}

export const createTheme = (isDark: boolean): Theme => ({
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animation: ANIMATION,
  layout: LAYOUT,
  components: COMPONENT_STYLES,
  isDark,
});

// Utility functions for theme usage
export const getThemeColor = (theme: Theme, colorPath: string, fallback: string = '#000000'): string => {
  const keys = colorPath.split('.');
  let current: any = theme.colors;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  
  return typeof current === 'string' ? current : fallback;
};

export const getResponsiveValue = <T>(
  values: { sm?: T; md?: T; lg?: T; xl?: T },
  screenWidth: number = SCREEN_WIDTH
): T | undefined => {
  if (screenWidth >= LAYOUT.container.xl && values.xl !== undefined) return values.xl;
  if (screenWidth >= LAYOUT.container.lg && values.lg !== undefined) return values.lg;
  if (screenWidth >= LAYOUT.container.md && values.md !== undefined) return values.md;
  if (screenWidth >= LAYOUT.container.sm && values.sm !== undefined) return values.sm;
  
  // Return the first available value as fallback
  return values.xl ?? values.lg ?? values.md ?? values.sm;
};

// Style composition utilities
export const combineStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => ({ ...acc, ...style }), {});
};

export const createVariant = (baseStyle: any, variants: Record<string, any>) => {
  return (variant: string) => combineStyles(baseStyle, variants[variant] || {});
};

// Accessibility helpers
export const getAccessibleColor = (theme: Theme, background: string): string => {
  // Simple contrast calculation - in production, use a proper contrast library
  const isDarkBackground = background.toLowerCase().includes('dark') || 
                          background === theme.colors.dark.background;
  
  return isDarkBackground ? theme.colors.dark.text.primary : theme.colors.light.text.primary;
};

// Animation helpers
export const createTransition = (property: string, duration: keyof typeof ANIMATION.duration = 'normal') => ({
  transition: `${property} ${ANIMATION.duration[duration]}ms ${ANIMATION.easing.easeInOut}`,
});

// Responsive breakpoint helpers
export const isSmallScreen = () => SCREEN_WIDTH < LAYOUT.container.sm;
export const isMediumScreen = () => SCREEN_WIDTH >= LAYOUT.container.sm && SCREEN_WIDTH < LAYOUT.container.md;
export const isLargeScreen = () => SCREEN_WIDTH >= LAYOUT.container.md;

// Platform-specific helpers
export const platformSelect = <T>(options: { ios?: T; android?: T; default: T }): T => {
  return Platform.select(options) ?? options.default;
};
