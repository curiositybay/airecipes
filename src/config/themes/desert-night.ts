import { Theme } from '@/config/theme';

export const desertNightTheme: Theme = {
  name: 'desert-night',
  colors: {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    secondary: 'bg-orange-600',
    secondaryHover: 'hover:bg-orange-700',
    accent: 'bg-yellow-500',
    accentHover: 'hover:bg-yellow-600',
    background: 'bg-stone-900',
    backgroundGradient:
      'bg-gradient-to-br from-stone-900 via-amber-900 to-orange-900',
    text: {
      primary: 'text-stone-100',
      secondary: 'text-stone-300',
      muted: 'text-stone-400',
      iconPrimary: 'text-amber-400',
      iconSecondary: 'text-orange-400',
    },
    css: {
      primary: '#ea580c', // orange-600
      primaryHover: '#c2410c', // orange-700
      secondary: '#d97706', // amber-600
      secondaryHover: '#b45309', // amber-700
      accent: '#eab308',
      accentHover: '#ca8a04',
      background: '#1c1917', // stone-900
      backgroundGradient:
        'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #57534e 100%)',
      textPrimary: '#f5f5f4', // stone-100
      textSecondary: '#d6d3d1', // stone-300
      textMuted: '#a8a29e', // stone-400
      textIconPrimary: '#fbbf24', // amber-400
      textIconSecondary: '#fb923c', // orange-400
      // Surface colors
      surface: '#292524', // stone-800
      surfaceHover: '#44403c', // stone-700
      surfaceSecondary: '#57534e', // stone-600
      surfaceSecondaryHover: '#78716c', // stone-500
      // Border colors
      border: '#44403c', // stone-700
      borderHover: '#57534e', // stone-600
      borderLight: '#292524', // stone-800
      borderError: '#ef4444',
      // Error colors
      error: '#ef4444',
      errorLight: '#7f1d1d', // red-900
      errorText: '#fecaca', // red-200
      // Success colors
      success: '#10b981',
      successLight: '#064e3b', // emerald-900
      successText: '#a7f3d0', // emerald-200
      // Warning colors
      warning: '#f59e0b',
      warningLight: '#78350f', // amber-900
      warningText: '#fde68a', // amber-200
      // Info colors
      info: '#3b82f6',
      infoLight: '#1e3a8a', // blue-900
      infoText: '#bfdbfe', // blue-200
      // Neutral colors
      neutral: '#6b7280',
      neutralLight: '#374151', // gray-800
      neutralText: '#d1d5db', // gray-300
      // Card colors
      card: '#292524', // stone-800
      cardHover: '#44403c', // stone-700
      cardBorder: '#57534e', // stone-600
      // Input colors
      input: '#44403c', // stone-700
      inputBorder: '#57534e', // stone-600
      inputFocus: '#fbbf24', // amber-400
      inputPlaceholder: '#78716c', // stone-500
      // Button text colors
      buttonText: '#ffffff',
      buttonTextSecondary: '#d1d5db', // gray-300
      // Footer colors
      footer: '#1c1917', // stone-900
      footerText: '#a8a29e', // stone-400
    },
  },
};
