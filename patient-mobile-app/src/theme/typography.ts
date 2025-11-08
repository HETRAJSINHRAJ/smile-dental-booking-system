import { Platform } from 'react-native';

const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
};

export const typography = {
  // Display styles
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: '700' as const,
  },
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },
  displaySmall: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },

  // Headline styles
  headlineLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },
  headlineMedium: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  headlinevSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },

  // Title styles
  titleLarge: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500' as const,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as const,
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },

  // Button styles
  button: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  buttonLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },
};
