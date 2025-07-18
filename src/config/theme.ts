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
  };
}

export const oceanTheme: Theme = {
  name: 'ocean',
  colors: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    secondary: 'bg-teal-600',
    secondaryHover: 'hover:bg-teal-700',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    background: 'bg-blue-50',
    backgroundGradient:
      'bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100',
    text: {
      primary: 'text-slate-800',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      iconPrimary: 'text-blue-600',
      iconSecondary: 'text-cyan-500',
    },
  },
};

export const defaultTheme = oceanTheme;

export const themes: Record<string, Theme> = {
  ocean: oceanTheme,
  // Add more themes here as needed.
  // sunset: sunsetTheme,
  // forest: forestTheme,
};

export function getTheme(themeName: string = 'ocean'): Theme {
  return themes[themeName] || defaultTheme;
}
