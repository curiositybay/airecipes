// Mock the rate-limit module
jest.mock('./lib/rate-limit', () => ({
  rateLimit: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    json: jest.fn(),
  },
}));

import { middleware, config } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './lib/rate-limit';

const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;
const mockNext = NextResponse.next as jest.MockedFunction<
  typeof NextResponse.next
>;
const mockJson = NextResponse.json as jest.MockedFunction<
  typeof NextResponse.json
>;

const createMockRequest = (
  url: string,
  headers: Record<string, string> = {}
) => {
  return {
    nextUrl: { pathname: new URL(url).pathname },
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
      set: jest.fn(),
    },
  } as unknown as NextRequest;
};

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockNext.mockReturnValue({
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    } as unknown as NextResponse);

    mockJson.mockReturnValue({
      status: 429,
      headers: {},
    } as unknown as NextResponse);
  });

  it('should export config with correct matcher', () => {
    expect(config).toEqual({
      matcher: '/api/:path*',
    });
  });

  it('should pass through non-API routes without rate limiting', async () => {
    const request = createMockRequest('http://localhost:3000/');
    await middleware(request);
    expect(mockRateLimit).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should apply rate limiting to API routes', async () => {
    const request = createMockRequest('http://localhost:3000/api/test', {
      'x-forwarded-for': '192.168.1.1',
    });
    const mockHeaders = {
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '59',
      'X-RateLimit-Reset': '1234567890',
    };

    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      reset: 1234567890,
      remaining: 59,
      headers: mockHeaders,
    });

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as NextResponse);

    const response = await middleware(request);

    expect(mockRateLimit).toHaveBeenCalledWith('192.168.1.1');
    expect(mockNext).toHaveBeenCalled();
    expect(response).toBe(mockResponse);
  });

  it('should return 429 when rate limit is exceeded', async () => {
    const request = createMockRequest('http://localhost:3000/api/test', {
      'x-real-ip': '192.168.1.2',
    });
    const mockHeaders = {
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '1234567890',
    };

    mockRateLimit.mockResolvedValue({
      success: false,
      limit: 60,
      reset: 1234567890,
      remaining: 0,
      headers: mockHeaders,
    });

    const mockJsonResponse = {
      status: 429,
      headers: mockHeaders,
    };
    mockJson.mockReturnValue(mockJsonResponse as unknown as NextResponse);

    const response = await middleware(request);

    expect(mockRateLimit).toHaveBeenCalledWith('192.168.1.2');
    expect(mockJson).toHaveBeenCalledWith(
      {
        error: 'Too many requests from this IP, please try again later.',
      },
      {
        status: 429,
        headers: mockHeaders,
      }
    );
    expect(response).toBe(mockJsonResponse);
  });

  it('should use x-real-ip when x-forwarded-for is not available', async () => {
    const request = createMockRequest('http://localhost:3000/api/test', {
      'x-real-ip': '192.168.1.3',
    });
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      reset: 1234567890,
      remaining: 59,
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '59',
        'X-RateLimit-Reset': '1234567890',
      },
    });

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as Response);

    await middleware(request);
    expect(mockRateLimit).toHaveBeenCalledWith('192.168.1.3');
  });

  it('should use unknown when no IP headers are available', async () => {
    const request = createMockRequest('http://localhost:3000/api/test');
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      reset: 1234567890,
      remaining: 59,
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '59',
        'X-RateLimit-Reset': '1234567890',
      },
    });

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as Response);

    await middleware(request);
    expect(mockRateLimit).toHaveBeenCalledWith('unknown');
  });

  it('should handle empty headers in rate limit response', async () => {
    const request = createMockRequest('http://localhost:3000/api/test');
    const mockHeaders = {
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '59',
      'X-RateLimit-Reset': '',
    };

    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      reset: 1234567890,
      remaining: 59,
      headers: mockHeaders,
    });

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as Response);

    const response = await middleware(request);
    expect(response).toBe(mockResponse);
  });

  it('should handle API routes with different paths', async () => {
    const paths = ['/api/health', '/api/users', '/api/posts/123'];
    for (const path of paths) {
      const request = createMockRequest(`http://localhost:3000${path}`);
      mockRateLimit.mockResolvedValue({
        success: true,
        limit: 60,
        reset: 1234567890,
        remaining: 59,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '59',
          'X-RateLimit-Reset': '1234567890',
        },
      });

      const mockResponse = {
        headers: {
          set: jest.fn(),
          get: jest.fn(),
        },
      };
      mockNext.mockReturnValue(mockResponse as unknown as Response);

      await middleware(request);
      expect(mockRateLimit).toHaveBeenCalled();
    }
  });

  it('should handle rate limit errors gracefully', async () => {
    const request = createMockRequest('http://localhost:3000/api/test');
    mockRateLimit.mockRejectedValue(new Error('Rate limit error'));

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as Response);

    const response = await middleware(request);
    expect(response).toBe(mockResponse);
  });

  it('should handle missing response headers', async () => {
    const request = createMockRequest('http://localhost:3000/api/test');
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 60,
      reset: 1234567890,
      remaining: 59,
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '59',
        'X-RateLimit-Reset': '1234567890',
      },
    });

    const mockResponse = {
      headers: {
        set: jest.fn(),
        get: jest.fn(),
      },
    };
    mockNext.mockReturnValue(mockResponse as unknown as Response);

    const response = await middleware(request);
    expect(response).toBe(mockResponse);
  });
});
