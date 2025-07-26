import { NextRequest } from 'next/server';
import mocks from '@/test-utils/mocks/mocks';

// Mock dependencies.
jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
}));

describe('api/v1/token-usage/recent/route', () => {
  let GET: (request: NextRequest) => Promise<Response>;
  let validateRequest: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();
    mocks.setup.all();

    // Import the route after mocks.
    ({ GET } = jest.requireActual('./route'));

    // Get mocked validation function.
    const validationModule = await import('@/lib/validation');
    validateRequest = validationModule.validateRequest as jest.Mock;
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    const mockTokenUsageData = [
      {
        id: '1',
        method: 'POST',
        model: 'gpt-4',
        promptTokens: 100,
        completionTokens: 50,
        success: true,
        errorMessage: null,
        createdAt: new Date('2023-01-01'),
      },
      {
        id: '2',
        method: 'POST',
        model: 'gpt-3.5-turbo',
        promptTokens: 200,
        completionTokens: 100,
        success: false,
        errorMessage: 'Rate limit exceeded',
        createdAt: new Date('2023-01-02'),
      },
    ];

    beforeEach(() => {
      // Mock successful validation by default.
      validateRequest.mockReturnValue({
        success: true,
        data: { limit: 50 },
      });

      // Mock successful database query by default.
      mocks.mock.prisma.client.tokenUsage.findMany.mockResolvedValue(
        mockTokenUsageData
      );
    });

    it('should successfully retrieve recent token usage with default limit', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.recentUsage).toEqual(mockTokenUsageData);

      // Verify validation was called with default limit.
      expect(validateRequest).toHaveBeenCalledWith(expect.any(Object), {
        limit: '50',
      });

      // Verify database query was called with correct parameters.
      expect(mocks.mock.prisma.client.tokenUsage.findMany).toHaveBeenCalledWith(
        {
          take: 50,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            method: true,
            model: true,
            promptTokens: true,
            completionTokens: true,
            success: true,
            errorMessage: true,
            createdAt: true,
          },
        }
      );
    });

    it('should handle empty result set', async () => {
      mocks.mock.prisma.client.tokenUsage.findMany.mockResolvedValue([]);

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.recentUsage).toEqual([]);
    });

    it('should handle validation failure', async () => {
      validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid limit parameter',
      });

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent?limit=invalid',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid limit parameter');
    });

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

    it('includes error details in development mode', async () => {
      const originalEnv = mocks.mock.config.app.nodeEnv;
      mocks.mock.config.env.development();

      const error = new Error('Database connection failed');
      (
        mocks.mock.prisma.client.tokenUsage.findMany as jest.Mock
      ).mockRejectedValue(error);

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/recent',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(responseData.details).toBe('Database connection failed');

      // Restore environment.
      mocks.mock.config.env.restore(originalEnv);
    });
  });
});
