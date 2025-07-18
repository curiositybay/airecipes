'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  return (
    <div className='flex flex-col space-y-2'>
      <label
        className={`text-sm font-medium ${currentTheme.colors.text.secondary}`}
      >
        Theme:
      </label>
      <select
        value={themeName}
        onChange={e => setTheme(e.target.value)}
        className={`px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-icon-primary theme-border-input theme-bg-input transition-colors duration-200`}
      >
        {availableThemes.map(theme => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
