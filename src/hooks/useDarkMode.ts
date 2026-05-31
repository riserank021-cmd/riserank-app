/**
 * useDarkMode — derives effective isDark from appStore theme preference
 * and the device's system appearance (useColorScheme).
 *
 * Usage:
 *   const { isDark, theme, setTheme } = useDarkMode();
 *
 * Apply 'dark' class to the root View in App.tsx when isDark is true
 * so NativeWind's dark: variants activate.
 */

import { useColorScheme } from 'react-native';
import { useAppStore, type Theme } from '../store/appStore';

export function useDarkMode() {
  const theme    = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const scheme   = useColorScheme(); // 'light' | 'dark' | null

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && scheme === 'dark');

  return { isDark, theme, setTheme } as {
    isDark: boolean;
    theme: Theme;
    setTheme: (t: Theme) => Promise<void>;
  };
}
