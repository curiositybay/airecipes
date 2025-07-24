import { setupApiMocks, clearApiMocks } from '@/test-utils/mocks';
import { setupApiRouteTest } from '@/test-utils/common-test-patterns';
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

setupApiRouteTest({});

describe('api/v1/ingredients/random/route', () => {
  let GET: () => Promise<Response>;

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
    it('returns random ingredients successfully', async () => {
      const mockIngredients = [
        { id: 1, name: 'tomato', category: 'vegetables' },
        { id: 2, name: 'pasta', category: 'grains' },
        { id: 3, name: 'olive oil', category: 'oils' },
        { id: 4, name: 'garlic', category: 'vegetables' },
      ];

      // Mock the raw query
      mockPrismaClient.$queryRaw.mockResolvedValue(mockIngredients);

      const response = await GET();
      const responseData = await response.json();

      expect(mockPrismaClient.$queryRaw).toHaveBeenCalled();
      expect(responseData).toEqual({
        success: true,
        ingredients: mockIngredients,
      });
      expect(response.status).toBe(200);
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.$queryRaw.mockRejectedValue(error);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to fetch random ingredients');
    });

    it('returns empty array when no ingredients are found', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([]);

      const response = await GET();
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: true,
        ingredients: [],
      });
      expect(response.status).toBe(200);
    });

    it('includes development error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      const error = new Error('Database connection failed');
      mockPrismaClient.$queryRaw.mockRejectedValue(error);

      const response = await GET();
      const responseData = await response.json();

      expect(responseData.details).toBe('Database connection failed');

      // Restore environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('excludes error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      const error = new Error('Database connection failed');
      mockPrismaClient.$queryRaw.mockRejectedValue(error);

      const response = await GET();
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
