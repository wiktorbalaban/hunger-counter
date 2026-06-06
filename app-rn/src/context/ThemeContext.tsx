import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { createMMKV } from 'react-native-mmkv';
import { Theme, lightTheme, darkTheme } from '../theme/default-theme';

export type ThemeMode = 'default' | 'light' | 'dark';

const themeStorage = createMMKV({ id: 'theme-storage' });
const THEME_MODE_KEY = 'theme_mode';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  themeMode: 'default',
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => (themeStorage.getString(THEME_MODE_KEY) as ThemeMode | undefined) ?? 'default'
  );

  useEffect(() => {
    setColorScheme(themeMode === 'default' ? 'system' : themeMode);
  }, [themeMode, setColorScheme]);

  const setThemeMode = (mode: ThemeMode) => {
    themeStorage.set(THEME_MODE_KEY, mode);
    setThemeModeState(mode);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
