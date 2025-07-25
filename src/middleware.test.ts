import mocks from './test-utils/mocks/mocks';

// Mock the middleware dependencies before importing.
jest.mock('@/lib/middleware-cache', () => ({
  getCachedAuthResult: mocks.mock.middlewareCache.mockGetCachedAuthResult,
  cacheAuthResult: mocks.mock.middlewareCache.mockCacheAuthResult,
  extractUserIdFromToken: mocks.mock.middlewareCache.mockExtractUserIdFromToken,
  clearCache: mocks.mock.middlewareCache.mockClearCache,
}));

jest.mock('@/lib/middleware-logger', () => ({
  __esModule: true,
  default: mocks.mock.middlewareLogger.mockMiddlewareLogger,
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ headers: new Map() })),
    redirect: jest.fn(() => ({ headers: new Map() })),
    json: jest.fn(),
  },
}));

// Setup mocks before importing the module under test.
mocks.setup.all();

import { NextResponse } from 'next/server';
import middleware, { config } from './middleware';

describe('middleware', () => {
  let mockNext: jest.MockedFunction<typeof NextResponse.next>;
  let mockRedirect: jest.MockedFunction<typeof NextResponse.redirect>;
  let mockGetCachedAuthResult: jest.MockedFunction<
    (...args: unknown[]) => Promise<unknown>
  >;
  let mockCacheAuthResult: jest.MockedFunction<(...args: unknown[]) => boolean>;
  let mockExtractUserIdFromToken: jest.MockedFunction<
    (token: string) => string | null
  >;
  let mockLogger: jest.Mocked<{
    info: jest.MockedFunction<
      (message: string, meta?: Record<string, unknown>) => void
    >;
    warn: jest.MockedFunction<
      (message: string, meta?: Record<string, unknown>) => void
    >;
    error: jest.MockedFunction<
      (message: string, meta?: Record<string, unknown>) => void
    >;
    debug: jest.MockedFunction<
      (message: string, meta?: Record<string, unknown>) => void
    >;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = NextResponse.next as jest.MockedFunction<
      typeof NextResponse.next
    >;
    mockRedirect = NextResponse.redirect as jest.MockedFunction<
      typeof NextResponse.redirect
    >;

    // Get mocked functions from the mocks architecture.
    mockGetCachedAuthResult =
      mocks.mock.middlewareCache.mockGetCachedAuthResult;
    mockCacheAuthResult = mocks.mock.middlewareCache.mockCacheAuthResult;
    mockExtractUserIdFromToken =
      mocks.mock.middlewareCache.mockExtractUserIdFromToken;
    mockLogger = mocks.mock.middlewareLogger.mockMiddlewareLogger;
  });

  afterEach(() => {
    mocks.setup.clear();
  });

  it('should export config with correct matcher', () => {
    expect(config).toEqual({
      matcher: ['/admin/:path*', '/api/:path*'],
    });
  });

  it('should allow non-API routes to pass through', async () => {
    const request = mocks.mock.next.createRequest('http://localhost:3000/');
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should apply rate limiting to API routes', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/api/test',
      {
        'x-forwarded-for': '192.168.1.1',
      }
    );

    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(response.headers.get('x-api-call-track')).toBe('true');
  });

  it('should allow admin routes with valid auth token', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    mocks.mock.http.fetchSuccess(mocks.mock.http.authSuccess);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(mockCacheAuthResult).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Auth verification from service',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        userId: '1',
        userEmail: 'test@example.com',
        cached: true,
      })
    );
  });

  it('should redirect admin routes without auth token', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should use cached auth result when available', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    // Mock cache hit.
    mockExtractUserIdFromToken.mockReturnValue('user123');
    mockGetCachedAuthResult.mockResolvedValue({
      id: 'user123',
      email: 'cached@example.com',
      role: 'user',
    });

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(mockGetCachedAuthResult).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Auth verification from cache',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        userId: 'user123',
        userEmail: 'cached@example.com',
      })
    );
  });

  it('should handle cache miss when userId extraction fails', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    // Mock userId extraction failure.
    mockExtractUserIdFromToken.mockReturnValue(null);
    mocks.mock.http.fetchSuccess(mocks.mock.http.authSuccess);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(mockGetCachedAuthResult).not.toHaveBeenCalled();
  });

  it('should handle cache miss when cached result is null', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    // Mock cache miss.
    mockExtractUserIdFromToken.mockReturnValue('user123');
    mockGetCachedAuthResult.mockResolvedValue(null);
    mocks.mock.http.fetchSuccess(mocks.mock.http.authSuccess);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(mockGetCachedAuthResult).toHaveBeenCalled();
  });

  it('should redirect admin route when auth verification returns no user', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should redirect admin route when auth verification returns success: false', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: false }),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should redirect admin route when auth verification throws an error', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    mocks.mock.http.fetchFailure(new Error('Network timeout'));

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Network error during auth verification',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        error: 'Network timeout',
      })
    );
  });

  it('should handle non-Error objects in catch block', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    // Mock fetch to throw a non-Error object.
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue('String error');

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Network error during auth verification',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        error: 'Unknown error',
      })
    );

    // Restore original fetch.
    global.fetch = originalFetch;
  });

  it('should redirect admin route when auth verification returns non-ok status', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Auth verification failed',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        status: 401,
      })
    );
  });

  it('should redirect admin route when auth verification response cannot be parsed', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON')),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to parse auth verification response',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        error: 'Invalid JSON',
      })
    );
  });

  it('should handle non-Error parse errors', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.reject('String parse error'),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to parse auth verification response',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        error: 'Unknown parse error',
      })
    );
  });

  it('should redirect admin route when auth verification response has invalid structure', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ invalid: 'structure' }),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Invalid auth verification response structure',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        data: '{"invalid":"structure"}',
      })
    );
  });

  it('should handle non-object data in invalid structure error', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'valid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve('string data'),
    };
    mocks.mock.http.fetchSuccess(mockResponse);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Invalid auth verification response structure',
      expect.objectContaining({
        pathname: '/admin/dashboard',
        data: 'string data',
      })
    );
  });
});
