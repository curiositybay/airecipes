import { setupApiMocks, clearApiMocks } from '@/test-utils/mocks';
import { setupApiRouteTest } from '@/test-utils/common-test-patterns';
import { NextRequest } from 'next/server';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const mockPrismaClient = mockDeep<PrismaClient>();

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock validation to always succeed
jest.mock('@/lib/validation', () => ({
  ...jest.requireActual('@/lib/validation'),
  validateRequest: jest.fn().mockReturnValue({
    success: true,
    data: { limit: 50 },
  }),
}));

setupApiRouteTest({});

describe('api/v1/token-usage/recent/route', () => {
  let GET: (request: NextRequest) => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    setupApiMocks();
    // Import the route after mocks
    ({ GET } = jest.requireActual('./route'));
  });

  afterEach(() => {
    clearApiMocks();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (mockPrismaClient.tokenUsage.findMany as jest.Mock).mockRejectedValue(
        error
      );

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to get recent token usage');
    });

    it('excludes error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      const error = new Error('Database connection failed');
      (mockPrismaClient.tokenUsage.findMany as jest.Mock).mockRejectedValue(
        error
      );

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(responseData.details).toBeUndefined();

      // Restore environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });
  });
});
