import '@testing-library/jest-dom';

// Mocks CSS imports - handles Tailwind CSS v4 syntax.
jest.mock('*.css', () => ({}));
jest.mock('*.scss', () => ({}));

// Mocks image imports.
jest.mock('*.svg', () => 'mocked-svg');
jest.mock('*.png', () => 'mocked-png');
jest.mock('*.jpg', () => 'mocked-jpg');

// Module-level mocks for React components and hooks
// These get hoisted properly by Jest

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Note: Component mocks are handled by individual test files
// to allow testing of the actual component implementations
// Only external libraries and contexts are mocked here

// Note: Hook mocks are handled by individual test files
// to allow testing of the actual hook implementations

// Global test utilities.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Only set up window mocks if we're in a browser-like environment
if (typeof window !== 'undefined') {
  // Mocks window.matchMedia.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated.
      removeListener: jest.fn(), // deprecated.
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
