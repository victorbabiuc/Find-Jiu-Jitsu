import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode } from '../types';
import { storageService } from '../services/storage.service';

const themes: Record<ThemeMode, Theme> = {
  dark: {
    name: 'dark',
    background: '#000000',
    surface: '#111111',
    surfaceHover: '#1a1a1a',
    border: '#262626',
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      tertiary: '#737373'
    },
    card: {
      background: '#0a0a0a',
      hover: '#141414'
    }
  },
  light: {
    name: 'light',
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    border: '#e5e7eb',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af'
    },
    card: {
      background: '#ffffff',
      hover: '#f9fafb'
    }
  }
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await storageService.getItem<ThemeMode>('theme');
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    await storageService.setItem('theme', newMode);
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await storageService.setItem('theme', mode);
  };

  return (
    <ThemeContext.Provider value={{
      theme: themes[themeMode],
      themeMode,
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};