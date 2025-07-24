// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
    })),
  },
}));

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tokenUsage: {
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(),
}));

const mockPrisma = jest.requireMock('@/lib/prisma').prisma;
const mockValidateRequest =
  jest.requireMock('@/lib/validation').validateRequest;

// Import after mocking
import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/v1/token-usage/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token usage statistics for all period', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/v1/token-usage/stats',
    } as NextRequest;

    mockValidateRequest.mockReturnValue({
      success: true,
      data: {
        period: 'all',
        model: undefined,
      },
    });

    mockPrisma.tokenUsage.aggregate.mockResolvedValue({
      _sum: {
        promptTokens: 1000,
        completionTokens: 500,
      },
      _count: {
        id: 10,
      },
    });

    mockPrisma.$queryRaw.mockResolvedValue([
      {
        date: new Date('2024-01-01'),
        promptTokens: 100,
        completionTokens: 50,
        requests: 1,
      },
    ]);

    mockPrisma.tokenUsage.groupBy.mockResolvedValue([
      {
        model: 'gpt-4',
        _sum: {
          promptTokens: 1000,
          completionTokens: 500,
        },
        _count: {
          id: 10,
        },
      },
    ]);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.period).toBe('all');
    expect(data.total.requests).toBe(10);
    expect(data.total.promptTokens).toBe(1000);
    expect(data.total.completionTokens).toBe(500);
  });

  it('should handle validation errors', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/v1/token-usage/stats?period=invalid',
    } as NextRequest;

    mockValidateRequest.mockReturnValue({
      success: false,
      error: 'Invalid period',
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid period');
  });

  it('should handle database errors', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/v1/token-usage/stats',
    } as NextRequest;

    mockValidateRequest.mockReturnValue({
      success: true,
      data: {
        period: 'all',
        model: undefined,
      },
    });

    mockPrisma.tokenUsage.aggregate.mockRejectedValue(
      new Error('Database error')
    );

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to get token usage statistics');
  });
});
