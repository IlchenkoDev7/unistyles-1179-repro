import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

export type ThemePreference = 'system' | 'light' | 'dark';

const COLOR_SCHEME: Record<ThemePreference, 'light' | 'dark' | 'unspecified'> = {
  system: 'unspecified',
  light: 'light',
  dark: 'dark',
};

// Two-layer theme applier, fired in one tick:
//   Layer 1 — native UIKit chrome via Appearance.setColorScheme (status bar,
//             native nav header, modals, keyboard).
//   Layer 2 — unistyles: `system` re-enables OS tracking (adaptiveThemes), while
//             light/dark disable tracking and pin the theme.
export function applyThemePreference(pref: ThemePreference): void {
  Appearance.setColorScheme(COLOR_SCHEME[pref]);

  if (pref === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }

  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(pref);
}

export function currentThemeName(): 'light' | 'dark' {
  return UnistylesRuntime.themeName === 'dark' ? 'dark' : 'light';
}

// The in-app explicit toggle: flips light↔dark through the manual two-layer path.
export function toggleTheme(): void {
  applyThemePreference(currentThemeName() === 'dark' ? 'light' : 'dark');
}
