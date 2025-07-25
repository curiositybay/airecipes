import '@testing-library/jest-dom';

// Mocks CSS imports - handles Tailwind CSS v4 syntax.
jest.mock('*.css', () => ({}));
jest.mock('*.scss', () => ({}));

// Mocks image imports.
jest.mock('*.svg', () => 'mocked-svg');
jest.mock('*.png', () => 'mocked-png');
jest.mock('*.jpg', () => 'mocked-jpg');

// Global test utilities.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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
