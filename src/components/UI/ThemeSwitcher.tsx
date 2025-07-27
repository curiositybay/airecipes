'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ToggleButton } from './ToggleButton';

export default function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();

  const isDarkMode = themeName === 'desert-night';
  const nextTheme = isDarkMode ? 'desert' : 'desert-night';
  const nextThemeIcon = isDarkMode ? 'fa-sun' : 'fa-moon';
  const nextThemeLabel = isDarkMode
    ? 'Switch to Light Mode'
    : 'Switch to Dark Mode';

  const handleToggle = () => {
    setTheme(nextTheme);
  };

  return (
    <ToggleButton
      onClick={handleToggle}
      icon={`fas ${nextThemeIcon}`}
      variant='ghost'
      size='md'
      ariaLabel={nextThemeLabel}
      title={nextThemeLabel}
      className='hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2'
    />
  );
}
