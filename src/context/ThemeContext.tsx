import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from '../types';

const theme: Theme = {
  background: '#ffffff',
  surface: '#f9fafb',
  surfaceHover: '#f3f4f6',
  border: '#e5e7eb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  card: {
    background: '#ffffff',
    hover: '#f9fafb',
  },
};

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
