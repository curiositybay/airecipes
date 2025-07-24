import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: jest.fn(),
    },
  },
  writable: true,
});

// Test component to access context
function TestComponent() {
  const { themeName, setTheme, availableThemes } = useTheme();

  return (
    <div>
      <div data-testid='theme-name'>{themeName}</div>
      <div data-testid='available-themes'>{availableThemes.join(', ')}</div>
      <button onClick={() => setTheme('ocean')}>Switch to Ocean</button>
      <button onClick={() => setTheme('desert-night')}>
        Switch to Desert Night
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide theme context with default theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');
    expect(screen.getByTestId('available-themes')).toContainHTML('desert');
    expect(screen.getByTestId('available-themes')).toContainHTML('ocean');
    expect(screen.getByTestId('available-themes')).toContainHTML(
      'desert-night'
    );
  });

  it('should provide theme context with custom initial theme', () => {
    render(
      <ThemeProvider initialTheme='ocean'>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('ocean');
  });

  it('should allow theme switching', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');

    const oceanButton = screen.getByText('Switch to Ocean');
    fireEvent.click(oceanButton);

    expect(screen.getByTestId('theme-name')).toHaveTextContent('ocean');
  });

  it('should throw error when useTheme is used outside provider', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
