// Luma Mobile - Material Design 3 Theme
// Inspired by Happy Coder - Purple/Violet palette

export const colors = {
  // Primary - Purple/Violet (Material Design 3)
  primary: '#c8bfff',
  primaryLight: '#e5deff',
  primaryDark: '#5e52a7',
  primaryContainer: '#463a8d',
  onPrimary: '#2f2176',
  primaryMuted: 'rgba(200, 191, 255, 0.15)',

  // Secondary - Lavender tones
  secondary: '#c9c3dc',
  secondaryContainer: '#474459',
  onSecondary: '#312e41',

  // Tertiary - Soft pink accents
  tertiary: '#ecb8ce',
  tertiaryContainer: '#613b4d',

  // Accent gradients
  gradientStart: '#c8bfff',
  gradientEnd: '#a89dff',
  gradientAlt: ['#463a8d', '#5e52a7'],

  // Backgrounds - Deep cool blacks
  background: '#1c1b1f',
  backgroundElevated: '#232227',
  backgroundCard: '#2a292e',
  backgroundCardHover: '#323136',
  surface: '#1c1b1f',
  surfaceVariant: '#48454f',

  // Surfaces with glass effect
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassLight: 'rgba(255, 255, 255, 0.07)',

  // Text hierarchy
  text: '#e5e1e6',
  textPrimary: '#e5e1e6',
  textSecondary: '#c9c5d0',
  textTertiary: 'rgba(229, 225, 230, 0.6)',
  textMuted: '#928f99',
  textDisabled: 'rgba(229, 225, 230, 0.3)',
  onSurface: '#e5e1e6',
  onSurfaceVariant: '#c9c5d0',

  // Status colors - Material Design 3
  success: '#7dd891',
  successMuted: 'rgba(125, 216, 145, 0.15)',
  successContainer: '#005319',
  warning: '#e4c04b',
  warningMuted: 'rgba(228, 192, 75, 0.15)',
  error: '#ffb4ab',
  errorMuted: 'rgba(255, 180, 171, 0.15)',
  errorContainer: '#93000a',
  onError: '#690005',
  info: '#a8c8ff',
  infoMuted: 'rgba(168, 200, 255, 0.15)',

  // Borders - Material Design 3 outlines
  border: '#48454f',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderFocus: '#c8bfff',
  outline: '#928f99',
  outlineVariant: '#48454f',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Mode badges
  modeFast: '#7dd891',
  modeFastBg: 'rgba(125, 216, 145, 0.12)',
  modePlanning: '#c8bfff',
  modePlanningBg: 'rgba(200, 191, 255, 0.12)',

  // Input
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBgFocus: 'rgba(200, 191, 255, 0.1)',

  // Chat bubbles
  userBubble: '#463a8d',
  userBubbleBorder: '#5e52a7',
  assistantBubble: 'rgba(255, 255, 255, 0.05)',
  assistantBubbleBorder: 'rgba(255, 255, 255, 0.08)',

  // Tool/Code blocks
  codeBackground: '#141318',
  codeBorder: '#48454f',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Inverse (for light surfaces on dark)
  inverseSurface: '#e5e1e6',
  inverseOnSurface: '#313033',
  inversePrimary: '#5e52a7',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Modern shadows with purple tint for primary elements
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#c8bfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  glowSm: {
    shadowColor: '#c8bfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
};

// Common style mixins
export const mixins = {
  glassCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.lg,
  },
  surfaceCard: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
  animation,
  mixins,
};
