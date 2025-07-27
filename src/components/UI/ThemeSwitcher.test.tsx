import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

// Mock the useTheme hook.
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// Mock the ToggleButton component.
jest.mock('./ToggleButton', () => ({
  ToggleButton: ({
    onClick,
    icon,
    ariaLabel,
    title,
    className,
  }: {
    onClick?: () => void;
    icon?: string;
    ariaLabel?: string;
    title?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      data-testid='theme-toggle'
      aria-label={ariaLabel}
      title={title}
      className={className}
    >
      <i className={icon} data-testid='theme-icon'></i>
    </button>
  ),
}));

describe('ThemeSwitcher', () => {
  const mockUseTheme = useTheme as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render light mode toggle when in dark mode', () => {
    mockUseTheme.mockReturnValue({
      themeName: 'desert-night',
      setTheme: jest.fn(),
    });

    render(<ThemeSwitcher />);

    expect(screen.getByTestId('theme-icon')).toHaveClass('fas fa-sun');
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

    expect(screen.getByTestId('theme-icon')).toHaveClass('fas fa-moon');
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
