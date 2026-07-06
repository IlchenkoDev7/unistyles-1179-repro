import { StyleSheet } from 'react-native-unistyles';

// Two visually distinct themes with a WIDE palette. Every screen paints from
// `theme.colors.*`, so a theme switch touches every styled node on every screen.
const lightTheme = {
  colors: {
    bg: '#ffffff',
    bgElevated: '#f7f8fa',
    text: '#0b0b0c',
    textMuted: '#6b7280',
    card: '#f3f4f6',
    cardAlt: '#e9ebef',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    success: '#16a34a',
    successSoft: '#dcfce7',
    warning: '#d97706',
    warningSoft: '#fef3c7',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    border: '#e5e7eb',
  },
} as const;

const darkTheme = {
  colors: {
    bg: '#0b0b0c',
    bgElevated: '#151518',
    text: '#f5f5f5',
    textMuted: '#9ca3af',
    card: '#1c1c1f',
    cardAlt: '#26262b',
    accent: '#60a5fa',
    accentSoft: '#1e3a5f',
    success: '#4ade80',
    successSoft: '#14361f',
    warning: '#fbbf24',
    warningSoft: '#3a2c0a',
    danger: '#f87171',
    dangerSoft: '#3a1414',
    border: '#2a2a2e',
  },
} as const;

const breakpoints = {
  xs: 0,
  sm: 375,
} as const;

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Adaptive (OS-driven) themes on: flipping the device's system appearance
// switches the app's theme with no in-app action. The in-app toggle flips to
// manual (setAdaptiveThemes(false) + setTheme) — see applyTheme.ts.
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});
