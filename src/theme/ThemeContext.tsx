import React, { createContext, useContext, useMemo } from 'react';
import { Colors, DarkTheme, LightTheme, ThemeType } from './colors';
import { usePreferencesStore } from '../state/client/preferencesStore';

interface ThemeContextType {
  colors: ThemeType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = usePreferencesStore();

  const value = useMemo(() => ({
    colors: darkMode ? DarkTheme : LightTheme,
    isDark: darkMode,
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback to DarkTheme if provider is missing
    return { colors: DarkTheme, isDark: true };
  }
  return context;
};

// Also export a helper to get colors outside of components if needed (not reactive)
export const getColors = () => {
  const { darkMode } = usePreferencesStore.getState();
  return darkMode ? DarkTheme : LightTheme;
};
