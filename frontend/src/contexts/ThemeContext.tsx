import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeMode, darkTheme, lightTheme } from '../styles/theme';
import GlobalStyles from '../styles/globalStyles';
import { useLocalStorage, useMediaQuery } from '../hooks';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'dark' 
}) => {
  // Use our custom hook instead of direct localStorage access
  const [mode, setMode] = useLocalStorage<ThemeMode>(STORAGE_KEYS.THEME, initialTheme);

  // Use our mediaQuery hook for system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Set the theme object based on mode
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  // Set a specific theme
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Update theme based on system preference if not explicitly set
  useEffect(() => {
    // Only apply if user hasn't explicitly set a preference
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode, setMode]);

  // Set theme class on body
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${mode}`);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 