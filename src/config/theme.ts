export interface Theme {
  name: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    background: string;
    backgroundGradient: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      iconPrimary: string;
      iconSecondary: string;
    };
    // CSS values for custom properties
    css: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      accent: string;
      accentHover: string;
      background: string;
      backgroundGradient: string;
      textPrimary: string;
      textSecondary: string;
      textMuted: string;
      textIconPrimary: string;
      textIconSecondary: string;
      // Surface colors
      surface: string;
      surfaceHover: string;
      surfaceSecondary: string;
      surfaceSecondaryHover: string;
      // Border colors
      border: string;
      borderHover: string;
      borderLight: string;
      borderError: string;
      // Error colors
      error: string;
      errorLight: string;
      errorText: string;
      // Success colors
      success: string;
      successLight: string;
      successText: string;
      // Warning colors
      warning: string;
      warningLight: string;
      warningText: string;
      // Info colors
      info: string;
      infoLight: string;
      infoText: string;
      // Neutral colors
      neutral: string;
      neutralLight: string;
      neutralText: string;
      // Card colors
      card: string;
      cardHover: string;
      cardBorder: string;
      // Input colors
      input: string;
      inputBorder: string;
      inputFocus: string;
      inputPlaceholder: string;
      // Button text colors
      buttonText: string;
      buttonTextSecondary: string;
      // Footer colors
      footer: string;
      footerText: string;
    };
  };
}

// Import themes from the themes directory
import { oceanTheme, desertTheme, desertNightTheme } from './themes';

export const defaultTheme = desertTheme;

export const themes: Record<string, Theme> = {
  ocean: oceanTheme,
  desert: desertTheme,
  'desert-night': desertNightTheme,
  // Add more themes here as needed.
  // sunset: sunsetTheme,
  // forest: forestTheme,
};

export function getTheme(themeName: string = 'desert'): Theme {
  return themes[themeName] || defaultTheme;
}
