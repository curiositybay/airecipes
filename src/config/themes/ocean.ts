import { Theme } from '../theme';

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
    css: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#0d9488',
      secondaryHover: '#0f766e',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      background: '#eff6ff',
      backgroundGradient:
        'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      textIconPrimary: '#2563eb',
      textIconSecondary: '#06b6d4',
      // Surface colors
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      surfaceSecondary: '#e2e8f0',
      surfaceSecondaryHover: '#cbd5e1',
      // Border colors
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      borderLight: '#f1f5f9',
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
      footer: '#1e293b', // dark blue-gray
      footerText: '#f1f5f9', // light text
    },
  },
};
