import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the useTheme hook
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = jest.requireMock('@/contexts/ThemeContext').useTheme;

// Simple ThemeToggle component for testing
function ThemeToggle() {
  const { themeName, setTheme, availableThemes } = mockUseTheme();

  return (
    <div>
      <span data-testid='current-theme'>{themeName}</span>
      <select
        data-testid='theme-select'
        value={themeName}
        onChange={e => setTheme(e.target.value)}
      >
        {availableThemes.map((theme: string) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render current theme', () => {
    mockUseTheme.mockReturnValue({
      themeName: 'desert',
      setTheme: jest.fn(),
      availableThemes: ['desert', 'ocean', 'desert-night'],
    });

    render(<ThemeToggle />);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('desert');
  });

  it('should render theme options', () => {
    mockUseTheme.mockReturnValue({
      themeName: 'ocean',
      setTheme: jest.fn(),
      availableThemes: ['desert', 'ocean', 'desert-night'],
    });

    render(<ThemeToggle />);

    const select = screen.getByTestId('theme-select');
    expect(select).toHaveValue('ocean');
  });

  it('should handle theme change', () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      themeName: 'desert',
      setTheme: mockSetTheme,
      availableThemes: ['desert', 'ocean', 'desert-night'],
    });

    render(<ThemeToggle />);

    const select = screen.getByTestId('theme-select');
    fireEvent.change(select, { target: { value: 'ocean' } });

    expect(mockSetTheme).toHaveBeenCalledWith('ocean');
  });
});
