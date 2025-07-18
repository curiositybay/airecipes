'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Theme, getTheme, themes, defaultTheme } from '@/config/theme';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

export function ThemeProvider({
  children,
  initialTheme = 'desert',
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState(initialTheme);
  const currentTheme = getTheme(themeName);
  const availableThemes = Object.keys(themes);

  // Set CSS custom properties on document root
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[themeName] || defaultTheme;

    // Set CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.css.primary);
    root.style.setProperty(
      '--color-primary-hover',
      theme.colors.css.primaryHover
    );
    root.style.setProperty('--color-secondary', theme.colors.css.secondary);
    root.style.setProperty(
      '--color-secondary-hover',
      theme.colors.css.secondaryHover
    );
    root.style.setProperty('--color-accent', theme.colors.css.accent);
    root.style.setProperty(
      '--color-accent-hover',
      theme.colors.css.accentHover
    );
    root.style.setProperty('--color-background', theme.colors.css.background);
    root.style.setProperty(
      '--color-background-gradient',
      theme.colors.css.backgroundGradient
    );
    root.style.setProperty(
      '--color-text-primary',
      theme.colors.css.textPrimary
    );
    root.style.setProperty(
      '--color-text-secondary',
      theme.colors.css.textSecondary
    );
    root.style.setProperty('--color-text-muted', theme.colors.css.textMuted);
    root.style.setProperty(
      '--color-text-icon-primary',
      theme.colors.css.textIconPrimary
    );
    root.style.setProperty(
      '--color-text-icon-secondary',
      theme.colors.css.textIconSecondary
    );

    // Surface colors
    root.style.setProperty('--color-surface', theme.colors.css.surface);
    root.style.setProperty(
      '--color-surface-hover',
      theme.colors.css.surfaceHover
    );
    root.style.setProperty(
      '--color-surface-secondary',
      theme.colors.css.surfaceSecondary
    );
    root.style.setProperty(
      '--color-surface-secondary-hover',
      theme.colors.css.surfaceSecondaryHover
    );

    // Border colors
    root.style.setProperty('--color-border', theme.colors.css.border);
    root.style.setProperty(
      '--color-border-hover',
      theme.colors.css.borderHover
    );
    root.style.setProperty(
      '--color-border-light',
      theme.colors.css.borderLight
    );
    root.style.setProperty(
      '--color-border-error',
      theme.colors.css.borderError
    );

    // Error colors
    root.style.setProperty('--color-error', theme.colors.css.error);
    root.style.setProperty('--color-error-light', theme.colors.css.errorLight);
    root.style.setProperty('--color-error-text', theme.colors.css.errorText);

    // Success colors
    root.style.setProperty('--color-success', theme.colors.css.success);
    root.style.setProperty(
      '--color-success-light',
      theme.colors.css.successLight
    );
    root.style.setProperty(
      '--color-success-text',
      theme.colors.css.successText
    );

    // Warning colors
    root.style.setProperty('--color-warning', theme.colors.css.warning);
    root.style.setProperty(
      '--color-warning-light',
      theme.colors.css.warningLight
    );
    root.style.setProperty(
      '--color-warning-text',
      theme.colors.css.warningText
    );

    // Info colors
    root.style.setProperty('--color-info', theme.colors.css.info);
    root.style.setProperty('--color-info-light', theme.colors.css.infoLight);
    root.style.setProperty('--color-info-text', theme.colors.css.infoText);

    // Neutral colors
    root.style.setProperty('--color-neutral', theme.colors.css.neutral);
    root.style.setProperty(
      '--color-neutral-light',
      theme.colors.css.neutralLight
    );
    root.style.setProperty(
      '--color-neutral-text',
      theme.colors.css.neutralText
    );

    // Card colors
    root.style.setProperty('--color-card', theme.colors.css.card);
    root.style.setProperty('--color-card-hover', theme.colors.css.cardHover);
    root.style.setProperty('--color-card-border', theme.colors.css.cardBorder);

    // Input colors
    root.style.setProperty('--color-input', theme.colors.css.input);
    root.style.setProperty(
      '--color-input-border',
      theme.colors.css.inputBorder
    );
    root.style.setProperty('--color-input-focus', theme.colors.css.inputFocus);
    root.style.setProperty(
      '--color-input-placeholder',
      theme.colors.css.inputPlaceholder
    );

    // Button text colors
    root.style.setProperty('--color-button-text', theme.colors.css.buttonText);
    root.style.setProperty(
      '--color-button-text-secondary',
      theme.colors.css.buttonTextSecondary
    );

    // Footer colors
    root.style.setProperty('--color-footer', theme.colors.css.footer);
    root.style.setProperty('--color-footer-text', theme.colors.css.footerText);
  }, [themeName]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
