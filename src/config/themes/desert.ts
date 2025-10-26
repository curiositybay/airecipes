import { Theme } from '@/config/theme';

export const desertTheme: Theme = {
  name: 'desert',
  colors: {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    secondary: 'bg-orange-600',
    secondaryHover: 'hover:bg-orange-700',
    accent: 'bg-yellow-500',
    accentHover: 'hover:bg-yellow-600',
    background: 'bg-amber-50',
    backgroundGradient:
      'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    text: {
      primary: 'text-stone-800',
      secondary: 'text-stone-600',
      muted: 'text-stone-500',
      iconPrimary: 'text-amber-600',
      iconSecondary: 'text-orange-500',
    },
    css: {
      primary: '#ea580c', // orange-600
      primaryHover: '#c2410c', // orange-700
      secondary: '#d97706', // amber-600
      secondaryHover: '#b45309', // amber-700
      accent: '#eab308',
      accentHover: '#ca8a04',
      background: 'white',
      backgroundGradient:
        'linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fef3c7 100%)',
      textPrimary: '#292524',
      textSecondary: '#57534e',
      textMuted: '#78716c',
      textIconPrimary: '#ea580c', // orange-600
      textIconSecondary: '#d97706', // amber-600
      // Surface colors
      surface: '#fdf6e3',
      surfaceHover: '#fcf3e0',
      surfaceSecondary: '#fbe9c6',
      surfaceSecondaryHover: '#fadf9f',
      // Border colors
      border: '#f5e6cb',
      borderHover: '#e9d5af',
      borderLight: '#fdf6e3',
      borderError: '#ef4444',
      // Error colors
      error: '#ef4444',
      errorLight: '#fee2e2',
      errorText: '#991b1b',
      // Success colors
      success: '#10b981',
      successLight: '#ecfdf5',
      successText: '#065f46',
      // Warning colors
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      warningText: '#92400e',
      // Info colors
      info: '#3b82f6',
      infoLight: '#eff6ff',
      infoText: '#1e40af',
      // Neutral colors
      neutral: '#6b7280',
      neutralLight: '#f3f4f6',
      neutralText: '#374151',
      // Card colors
      card: '#ffffff',
      cardHover: '#f9fafb',
      cardBorder: '#e5e7eb',
      // Input colors
      input: '#f3f4f6',
      inputBorder: '#d1d5db',
      inputFocus: '#93c5fd',
      inputPlaceholder: '#9ca3af',
      // Button text colors
      buttonText: '#ffffff',
      buttonTextSecondary: '#4b5563',
      // Footer colors
      footer: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fef3c7 100%)',
      footerText: '#4b5563',
    },
  },
};
