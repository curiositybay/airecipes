// Import setup functions from submodules.
import { mockAppConfigModule } from './config';
import { mockNextServerModule } from './next-server';
import { setupFetchMocks } from './http';
import { setupRateLimitMocks } from './rate-limit';
import { setupPrismaMocks } from './prisma';

import { setupValidationMocks } from './validation';
import * as validationMocks from './validation';
import { setupAuthMocks } from './auth';
import { setupMiddlewareCacheMocks } from './middleware-cache';
import { setupMiddlewareLoggerMocks } from './middleware-logger';
import { setupReactComponentMocks } from './react-components';
import { setupNextAppMocks } from './next-app';

// Import all mock utilities from submodules.
import * as nextServerMocks from './next-server';
import * as httpMocks from './http';
import * as configMocks from './config';
import * as rateLimitMocks from './rate-limit';
import * as prismaMocks from './prisma';
import * as ingredientMocks from './ingredients';

// Validation mocks are now automatically handled by Jest
import * as authMocks from './auth';
import * as middlewareCacheMocks from './middleware-cache';
import * as middlewareLoggerMocks from './middleware-logger';
import * as reactComponentMocks from './react-components';
import * as nextAppMocks from './next-app';

// Frontend-specific mocks
export const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

export const setupLocalStorageMock = () => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

export const setupScrollIntoViewMock = () => {
  Element.prototype.scrollIntoView = jest.fn();
};

// Create a single mocks object that contains everything.
export const mocks = {
  // Setup and teardown methods.
  setup: {
    all: () => {
      mockAppConfigModule();
      mockNextServerModule();
      setupFetchMocks();
      setupRateLimitMocks();
      setupPrismaMocks();
      setupValidationMocks();
      setupAuthMocks();
      setupMiddlewareCacheMocks();
      setupMiddlewareLoggerMocks();
      setupReactComponentMocks();
      setupNextAppMocks();
    },

    clear: () => {
      jest.clearAllMocks();
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
      localStorageMock.clear.mockClear();
    },

    // Convenience method that returns cleanup function.
    withCleanup: () => {
      mocks.setup.all();
      return () => mocks.setup.clear();
    },
  },

  // All mock objects and utilities organized by domain.
  mock: {
    // Next.js server mocks.
    next: {
      ...nextServerMocks,
      createRequest: nextServerMocks.createMockNextRequest,
      createResponse: nextServerMocks.createMockNextResponse,
    },

    // HTTP/fetch mocks.
    http: {
      ...httpMocks,
      authSuccess: httpMocks.mockAuthSuccessResponse,
      authFailure: httpMocks.mockAuthFailureResponse,
      networkError: httpMocks.mockNetworkError,
      fetchSuccess: httpMocks.mockFetchSuccess,
      fetchFailure: httpMocks.mockFetchFailure,
    },

    // Config mocks.
    config: {
      ...configMocks,
      app: configMocks.mockAppConfig,
      env: configMocks.mockEnvironment,
    },

    // Rate limit mocks.
    rateLimit: {
      ...rateLimitMocks,
      fn: rateLimitMocks.mockRateLimit,
      success: rateLimitMocks.mockRateLimitSuccess,
      failure: rateLimitMocks.mockRateLimitFailure,
      successResponse: rateLimitMocks.mockRateLimitSuccessResponse,
      failureResponse: rateLimitMocks.mockRateLimitFailureResponse,
      error: rateLimitMocks.mockRateLimitError,
    },

    // Prisma mocks.
    prisma: {
      ...prismaMocks,
      client: prismaMocks.mockPrismaClient,
    },

    // Validation mocks.
    validation: {
      ...validationMocks,
      instance: validationMocks.mockValidation,
    },

    // Auth mocks.
    auth: {
      ...authMocks,
      requireAuth: authMocks.mockRequireAuth,
    },

    // Ingredient mocks.
    ingredients: {
      ...ingredientMocks,
    },

    // Middleware cache mocks.
    middlewareCache: {
      ...middlewareCacheMocks,
    },

    // Middleware logger mocks.
    middlewareLogger: {
      ...middlewareLoggerMocks,
    },

    // React component mocks.
    react: {
      ...reactComponentMocks,
    },

    // Next.js app mocks.
    nextApp: {
      ...nextAppMocks,
    },

    // Frontend mocks.
    frontend: {
      localStorage: localStorageMock,
      setupLocalStorage: setupLocalStorageMock,
      setupScrollIntoView: setupScrollIntoViewMock,
    },

    // Process and console mocks.
    process: {
      uptime: jest.fn().mockReturnValue(123.456),
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_APP_NAME: 'Test App',
        NEXT_PUBLIC_APP_VERSION: '0.0.1',
        NEXT_PUBLIC_APP_ENVIRONMENT: 'test',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
        OPENAI_API_KEY: 'test-openai-key',
        OPENAI_MODEL: 'gpt-4o-mini',
        AUTH_SERVICE_URL: 'http://test-auth-service',
        REDIS_URL: 'redis://localhost:6379',
        REDIS_PASSWORD: 'test-password',
      },
    },
  },
};

// Also export the mocks object as default for convenience.
export default mocks;
