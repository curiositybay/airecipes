// Import setup functions from submodules.
import { mockAppConfigModule } from './config';
import { mockNextServerModule } from './next-server';
import { setupFetchMocks } from './http';
import { setupRateLimitMocks } from './rate-limit';
import { setupPrismaMocks } from './prisma';
import { setupLoggerMocks } from './logger';
import { setupValidationMocks } from './validation';
import { setupAuthMocks } from './auth';
import { setupMiddlewareCacheMocks } from './middleware-cache';
import { setupMiddlewareLoggerMocks } from './middleware-logger';

// Import all mock utilities from submodules.
import * as nextServerMocks from './next-server';
import * as httpMocks from './http';
import * as configMocks from './config';
import * as rateLimitMocks from './rate-limit';
import * as prismaMocks from './prisma';
import * as loggerMocks from './logger';
import * as validationMocks from './validation';
import * as authMocks from './auth';
import * as middlewareCacheMocks from './middleware-cache';
import * as middlewareLoggerMocks from './middleware-logger';

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
      setupLoggerMocks();
      setupValidationMocks();
      setupAuthMocks();
      setupMiddlewareCacheMocks();
      setupMiddlewareLoggerMocks();
    },

    clear: () => {
      jest.clearAllMocks();
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

    // Logger mocks.
    logger: {
      ...loggerMocks,
      instance: loggerMocks.mockLogger,
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

    // Middleware cache mocks.
    middlewareCache: {
      ...middlewareCacheMocks,
    },

    // Middleware logger mocks.
    middlewareLogger: {
      ...middlewareLoggerMocks,
    },
  },
};

// Also export the mocks object as default for convenience.
export default mocks;
