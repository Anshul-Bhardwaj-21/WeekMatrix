/**
 * WeekMatrix App Theme Colors
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563eb';
const tintColorDark = '#60a5fa';

export const Colors = {
  light: {
    text: '#1f2937',
    background: '#ffffff',
    surface: '#f9fafb',
    border: '#e5e7eb',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorLight,
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    muted: '#9ca3af',
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    surface: '#1f2937',
    border: '#374151',
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    muted: '#6b7280',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});