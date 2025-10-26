import '@testing-library/jest-dom';

// Only set test environment variables when running tests
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
  // Set up test environment variables before any modules are loaded
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_APP_NAME = 'Test App';
  process.env.NEXT_PUBLIC_APP_VERSION = '0.0.1';
  process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'test';
  process.env.NEXT_PUBLIC_APP_DESCRIPTION = 'Test App Description';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_APP_SLUG = 'test-app';
  process.env.NEXT_PUBLIC_APP_DOMAIN = 'test-domain.com';
  process.env.NEXT_PUBLIC_APP_URL = 'https://test-domain.com';
  process.env.NEXT_PUBLIC_GITHUB_REPO = 'https://github.com/test/repo';
  process.env.NEXT_PUBLIC_APP_AUTHOR = 'Test Author';
  process.env.NEXT_PUBLIC_APP_KEYWORDS = 'test, app';
  process.env.NEXT_PUBLIC_TWITTER_HANDLE = '@test';
  process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'test@example.com';
  process.env.NEXT_PUBLIC_404_MESSAGE = 'Test 404 message';
  process.env.NEXT_PUBLIC_500_MESSAGE = 'Test 500 message';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.OPENAI_MODEL = 'gpt-4o-mini';
  process.env.AUTH_SERVICE_URL = 'http://test-auth-service';
  process.env.REDIS_URL = 'redis://localhost:6379';
}

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
