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

// Helper function to render with ThemeProvider
function renderWithTheme(
  children = <TestComponent />,
  initialTheme = 'desert'
) {
  return render(
    <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
  );
}

// Helper function to click buttons
async function clickButton(label: string) {
  fireEvent.click(screen.getByText(label));
}

// Test component to access context
function TestComponent() {
  const { themeName, setTheme, availableThemes } = useTheme();

  return (
    <div>
      <div data-testid='theme-name'>{themeName}</div>
      <div data-testid='available-themes'>{availableThemes.join(', ')}</div>
      <button onClick={() => setTheme('desert')}>Switch to Desert</button>
      <button onClick={() => setTheme('desert-night')}>
        Switch to Desert Night
      </button>
      <button onClick={() => setTheme('invalid-theme')}>
        Switch to Invalid Theme
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when initialized', () => {
    describe('with default theme', () => {
      it('provides correct theme context', () => {
        renderWithTheme();

        expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');
        expect(screen.getByTestId('available-themes')).toContainHTML('desert');
        expect(screen.getByTestId('available-themes')).toContainHTML(
          'desert-night'
        );
      });

      it('sets CSS custom properties', () => {
        renderWithTheme();

        expect(document.documentElement.style.setProperty).toHaveBeenCalled();
      });
    });

    describe('with undefined initial theme', () => {
      it('uses default theme', () => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );

        expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');
      });
    });

    describe('with custom initial theme', () => {
      it('provides correct theme context', () => {
        renderWithTheme(undefined, 'desert-night');

        expect(screen.getByTestId('theme-name')).toHaveTextContent(
          'desert-night'
        );
      });
    });

    describe('with invalid theme name', () => {
      it('uses default theme fallback', () => {
        renderWithTheme(undefined, 'invalid-theme');

        expect(screen.getByTestId('theme-name')).toHaveTextContent(
          'invalid-theme'
        );
        expect(document.documentElement.style.setProperty).toHaveBeenCalled();
      });
    });
  });

  describe('theme switching', () => {
    describe('when valid theme is provided', () => {
      it('changes theme successfully', () => {
        renderWithTheme();

        expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');

        clickButton('Switch to Desert Night');

        expect(screen.getByTestId('theme-name')).toHaveTextContent(
          'desert-night'
        );
      });

      it('sets CSS custom properties', () => {
        renderWithTheme();

        // Clear the initial calls
        jest.clearAllMocks();

        clickButton('Switch to Desert Night');

        expect(document.documentElement.style.setProperty).toHaveBeenCalled();
      });
    });

    describe('when invalid theme is provided', () => {
      it('does not change theme', () => {
        renderWithTheme();

        expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');

        clickButton('Switch to Invalid Theme');

        expect(screen.getByTestId('theme-name')).toHaveTextContent('desert');
      });
    });
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
