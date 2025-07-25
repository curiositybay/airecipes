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

jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(),
}));

describe('/api/v1/ingredients/search', () => {
  let GET: (request: NextRequest) => Promise<Response>;
  let validateRequest: jest.Mock;

  beforeEach(async () => {
    mocks.setup.all();

    // Import the actual route handler
    const routeModule = await import('./route');
    GET = routeModule.GET;

    // Get mocked dependencies
    const validationModule = await import('@/lib/validation');
    validateRequest = validationModule.validateRequest as jest.Mock;
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  // Helper function to create mock requests
  const createMockRequest = (
    searchParams: Record<string, string>
  ): NextRequest => {
    const url = new URL('http://localhost:3000/api/v1/ingredients/search');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return {
      url: url.toString(),
    } as unknown as NextRequest;
  };

  describe('GET /api/v1/ingredients/search', () => {
    const mockIngredients = [
      {
        id: 'ingredient-1',
        name: 'apple',
        category: 'fruits',
      },
      {
        id: 'ingredient-2',
        name: 'apricot',
        category: 'fruits',
      },
      {
        id: 'ingredient-3',
        name: 'avocado',
        category: 'vegetables',
      },
    ];

    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();

      // Mock successful validation
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'apple',
          limit: 10,
          category: undefined,
        },
      });

      // Mock successful database query
      mocks.mock.prisma.client.ingredient.findMany.mockResolvedValue(
        mockIngredients
      );
    });

    it('should successfully search ingredients with query parameter', async () => {
      const request = createMockRequest({ q: 'apple' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual(mockIngredients);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' },
          },
          orderBy: [{ name: 'asc' }],
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should search ingredients with category filter', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'apple',
          limit: 10,
          category: 'fruits',
        },
      });

      const request = createMockRequest({ q: 'apple', category: 'fruits' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' },
            category: 'fruits',
          },
          orderBy: [{ name: 'asc' }],
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should search ingredients with custom limit', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'apple',
          limit: 5,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: 'apple', limit: '5' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' },
          },
          orderBy: [{ name: 'asc' }],
          take: 5,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should return empty array when query is empty', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: '',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: '' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual([]);

      // Should not call the database when query is empty
      expect(
        mocks.mock.prisma.client.ingredient.findMany
      ).not.toHaveBeenCalled();
    });

    it('should return empty array when query is only whitespace', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: '   ',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: '   ' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual([]);

      // Should not call the database when query is only whitespace
      expect(
        mocks.mock.prisma.client.ingredient.findMany
      ).not.toHaveBeenCalled();
    });

    it('should handle validation failure', async () => {
      validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid query parameter',
      });

      const request = createMockRequest({ q: 'invalid' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid query parameter');
    });

    it('should handle database errors', async () => {
      // Ensure we're in development mode
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      mocks.mock.prisma.client.ingredient.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = createMockRequest({ q: 'apple' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to search ingredients');
      expect(responseData.details).toBeDefined(); // Should include error details in development

      // Restore NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('should handle database errors in production without exposing details', async () => {
      // Mock NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      mocks.mock.prisma.client.ingredient.findMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = createMockRequest({ q: 'apple' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to search ingredients');
      expect(responseData.details).toBeUndefined(); // Should not include error details in production

      // Restore NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('should normalize search term to lowercase', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'APPLE',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: 'APPLE' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' }, // Should be lowercase
          },
          orderBy: [{ name: 'asc' }],
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should trim whitespace from search term', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: '  apple  ',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: '  apple  ' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' }, // Should be trimmed
          },
          orderBy: [{ name: 'asc' }],
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should handle missing query parameter', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: '',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({});

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual([]);
    });

    it('should handle missing limit parameter', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'apple',
          limit: 10, // Default value
          category: undefined,
        },
      });

      const request = createMockRequest({ q: 'apple' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' },
          },
          orderBy: [{ name: 'asc' }],
          take: 10, // Should use default limit
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should handle missing category parameter', async () => {
      validateRequest.mockReturnValue({
        success: true,
        data: {
          q: 'apple',
          limit: 10,
          category: undefined,
        },
      });

      const request = createMockRequest({ q: 'apple' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      expect(mocks.mock.prisma.client.ingredient.findMany).toHaveBeenCalledWith(
        {
          where: {
            isActive: true,
            name: { startsWith: 'apple' },
            // Should not include category filter
          },
          orderBy: [{ name: 'asc' }],
          take: 10,
          select: {
            id: true,
            name: true,
            category: true,
          },
        }
      );
    });

    it('should return empty array when no ingredients match', async () => {
      mocks.mock.prisma.client.ingredient.findMany.mockResolvedValue([]);

      const request = createMockRequest({ q: 'nonexistent' });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual([]);
    });
  });
});
