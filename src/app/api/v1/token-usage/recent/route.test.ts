import { NextRequest } from 'next/server';
import mocks from '@/test-utils/mocks/mocks';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
}));

jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
  },
}));

describe('api/v1/token-usage/recent/route', () => {
  let GET: (request: NextRequest) => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    mocks.setup.all();
    // Import the route after mocks
    ({ GET } = jest.requireActual('./route'));
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (
        mocks.mock.prisma.client.tokenUsage.findMany as jest.Mock
      ).mockRejectedValue(error);

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
      (
        mocks.mock.prisma.client.tokenUsage.findMany as jest.Mock
      ).mockRejectedValue(error);

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
