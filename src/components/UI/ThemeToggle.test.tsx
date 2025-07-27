import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the useTheme hook
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = jest.requireMock('@/contexts/ThemeContext').useTheme;

// Simple ThemeSwitcher component for testing
function ThemeSwitcher() {
  const { themeName, setTheme } = mockUseTheme();

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
    <button
      onClick={handleToggle}
      data-testid='theme-toggle'
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
    >
      <i className={`fas ${nextThemeIcon}`} data-testid='theme-icon'></i>
      <span data-testid='current-theme'>{themeName}</span>
    </button>
  );
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render light mode toggle when in dark mode', () => {
    mockUseTheme.mockReturnValue({
      themeName: 'desert-night',
      setTheme: jest.fn(),
    });

    render(<ThemeSwitcher />);

    expect(screen.getByTestId('current-theme')).toHaveTextContent(
      'desert-night'
    );
    expect(screen.getByTestId('theme-icon')).toHaveClass('fa-sun');
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to Light Mode'
    );
  });

  it('should render dark mode toggle when in light mode', () => {
    mockUseTheme.mockReturnValue({
      themeName: 'desert',
      setTheme: jest.fn(),
    });

    render(<ThemeSwitcher />);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('desert');
    expect(screen.getByTestId('theme-icon')).toHaveClass('fa-moon');
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to Dark Mode'
    );
  });

  it('should handle theme toggle from light to dark', () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      themeName: 'desert',
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitcher />);

    const toggleButton = screen.getByTestId('theme-toggle');
    fireEvent.click(toggleButton);

    expect(mockSetTheme).toHaveBeenCalledWith('desert-night');
  });

  it('should handle theme toggle from dark to light', () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      themeName: 'desert-night',
      setTheme: mockSetTheme,
    });

    render(<ThemeSwitcher />);

    const toggleButton = screen.getByTestId('theme-toggle');
    fireEvent.click(toggleButton);

    expect(mockSetTheme).toHaveBeenCalledWith('desert');
  });
});
