// Import setup functions from submodules.
import { mockAppConfigModule } from './config';
import { mockNextServerModule } from './next-server';

import { setupFetchMocks } from './http';

import { setupPrismaMocks } from './prisma';

import { setupValidationMocks } from './validation';
import * as validationMocks from './validation';
import { setupAuthMocks } from './auth';

import {
  setupClipboardMock,
  clipboardMock,
  mockClipboardSuccess,
  mockClipboardError,
} from './frontend';

// Import all mock utilities from submodules.
import * as nextServerMocks from './next-server';
import * as httpMocks from './http';
import * as configMocks from './config';

import * as prismaMocks from './prisma';
import * as ingredientMocks from './ingredients';
import * as recipeMocks from './recipes';

// Validation mocks are now automatically handled by Jest
import * as authMocks from './auth';

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

// Create a single mocks object that contains everything.
export const mocks = {
  // Setup and teardown methods.
  setup: {
    all: () => {
      mockAppConfigModule();
      mockNextServerModule();

      setupFetchMocks();

      setupPrismaMocks();
      setupValidationMocks();
      setupAuthMocks();
    },

    clear: () => {
      jest.clearAllMocks();
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
      localStorageMock.clear.mockClear();
    },

    // Frontend-specific setup methods.
    frontend: {
      setupLocalStorage: setupLocalStorageMock,
      setupClipboard: setupClipboardMock,
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

    // Recipe mocks.
    recipes: {
      ...recipeMocks,
    },

    // Next.js app mocks.
    nextApp: {
      ...nextAppMocks,
    },

    // Frontend mocks.
    frontend: {
      localStorage: localStorageMock,
      setupLocalStorage: setupLocalStorageMock,
      clipboard: clipboardMock,
      setupClipboard: setupClipboardMock,
      mockClipboardSuccess,
      mockClipboardError,
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
