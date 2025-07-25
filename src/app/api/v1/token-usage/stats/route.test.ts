import { NextRequest } from 'next/server';
import mocks from '@/test-utils/mocks/mocks';

// Mock dependencies.
jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
}));

jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: mocks.mock.logger.instance,
}));

jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(),
}));

describe('api/v1/token-usage/stats/route', () => {
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
    const mockAggregateResult = {
      _sum: {
        promptTokens: 1000,
        completionTokens: 500,
      },
      _count: {
        id: 10,
      },
    };

    const mockDailyBreakdown = [
      {
        date: new Date('2024-01-01'),
        promptTokens: 100,
        completionTokens: 50,
        requests: 1,
      },
      {
        date: new Date('2024-01-02'),
        promptTokens: 200,
        completionTokens: 100,
        requests: 2,
      },
    ];

    const mockModelBreakdown = [
      {
        model: 'gpt-4',
        _sum: {
          promptTokens: 800,
          completionTokens: 400,
        },
        _count: {
          id: 8,
        },
      },
      {
        model: 'gpt-3.5-turbo',
        _sum: {
          promptTokens: 200,
          completionTokens: 100,
        },
        _count: {
          id: 2,
        },
      },
    ];

    beforeEach(() => {
      // Mock successful validation by default.
      validateRequest.mockReturnValue({
        success: true,
        data: {
          period: 'all',
          model: undefined,
        },
      });

      // Mock successful database queries by default.
      mocks.mock.prisma.client.tokenUsage.aggregate.mockResolvedValue(
        mockAggregateResult
      );
      mocks.mock.prisma.client.$queryRaw.mockResolvedValue(mockDailyBreakdown);
      mocks.mock.prisma.client.tokenUsage.groupBy.mockResolvedValue(
        mockModelBreakdown
      );
    });

    it('should return token usage statistics for all period', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.period).toBe('all');
      expect(data.model).toBeUndefined();
      expect(data.total.requests).toBe(10);
      expect(data.total.promptTokens).toBe(1000);
      expect(data.total.completionTokens).toBe(500);
      expect(data.dailyBreakdown).toHaveLength(2);
      expect(data.modelBreakdown).toHaveLength(2);
    });

    it('should handle today period filter', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats?period=today',
      } as NextRequest;

      validateRequest.mockReturnValue({
        success: true,
        data: {
          period: 'today',
          model: undefined,
        },
      });

      await GET(request);

      // Verify aggregate query was called with today filter.
      expect(
        mocks.mock.prisma.client.tokenUsage.aggregate
      ).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });

      // Verify groupBy query was called with today filter.
      expect(mocks.mock.prisma.client.tokenUsage.groupBy).toHaveBeenCalledWith({
        by: ['model'],
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it('should handle week period filter', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats?period=week',
      } as NextRequest;

      validateRequest.mockReturnValue({
        success: true,
        data: {
          period: 'week',
          model: undefined,
        },
      });

      await GET(request);

      // Verify aggregate query was called with week filter.
      expect(
        mocks.mock.prisma.client.tokenUsage.aggregate
      ).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it('should handle month period filter', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats?period=month',
      } as NextRequest;

      validateRequest.mockReturnValue({
        success: true,
        data: {
          period: 'month',
          model: undefined,
        },
      });

      await GET(request);

      // Verify aggregate query was called with month filter.
      expect(
        mocks.mock.prisma.client.tokenUsage.aggregate
      ).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it('should handle model-specific filtering', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats?model=gpt-4',
      } as NextRequest;

      validateRequest.mockReturnValue({
        success: true,
        data: {
          period: 'all',
          model: 'gpt-4',
        },
      });

      await GET(request);

      // Verify aggregate query was called with model filter.
      expect(
        mocks.mock.prisma.client.tokenUsage.aggregate
      ).toHaveBeenCalledWith({
        where: {
          model: 'gpt-4',
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });

      // Verify groupBy query was called with model filter.
      expect(mocks.mock.prisma.client.tokenUsage.groupBy).toHaveBeenCalledWith({
        by: ['model'],
        where: {
          model: 'gpt-4',
        },
        _sum: {
          promptTokens: true,
          completionTokens: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it('should execute daily breakdown query', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      await GET(request);

      // Verify daily breakdown query was called.
      expect(mocks.mock.prisma.client.$queryRaw).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('SELECT')])
      );
    });

    it('should transform data correctly', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      const response = await GET(request);
      const data = await response.json();

      // Verify data transformation.
      expect(data.dailyBreakdown[0]).toEqual({
        date: mockDailyBreakdown[0].date,
        promptTokens: 100,
        completionTokens: 50,
        requests: 1,
      });

      expect(data.modelBreakdown[0]).toEqual({
        model: 'gpt-4',
        requests: 8,
        promptTokens: 800,
        completionTokens: 400,
      });
    });

    it('should handle null/undefined values in aggregation', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      // Mock null values in aggregation result.
      mocks.mock.prisma.client.tokenUsage.aggregate.mockResolvedValue({
        _sum: {
          promptTokens: null,
          completionTokens: null,
        },
        _count: {
          id: null,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.total.requests).toBe(0);
      expect(data.total.promptTokens).toBe(0);
      expect(data.total.completionTokens).toBe(0);
    });

    it('should handle validation errors', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats?period=invalid',
      } as NextRequest;

      validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid period',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid period');
    });

    it('should handle database errors', async () => {
      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      mocks.mock.prisma.client.tokenUsage.aggregate.mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to get token usage statistics');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = mocks.mock.config.app.nodeEnv;
      mocks.mock.config.env.development();

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      mocks.mock.prisma.client.tokenUsage.aggregate.mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.details).toBe('Database error');

      // Restore environment.
      mocks.mock.config.env.restore(originalEnv);
    });

    it('should exclude error details when NODE_ENV is not development', async () => {
      const originalEnv = mocks.mock.config.app.nodeEnv;
      mocks.mock.config.env.test();

      const request = {
        url: 'http://localhost:3000/api/v1/token-usage/stats',
      } as NextRequest;

      mocks.mock.prisma.client.tokenUsage.aggregate.mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.details).toBeUndefined();

      // Restore environment.
      mocks.mock.config.env.restore(originalEnv);
    });
  });
});
