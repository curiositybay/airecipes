import { NextRequest, NextResponse } from 'next/server';
import middleware, { config } from './middleware';

// Mock the rate limiting function
const mockRateLimit = jest.fn();
jest.mock('./lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
    json: jest.fn(),
  },
}));

describe('middleware', () => {
  let mockNext: jest.MockedFunction<typeof NextResponse.next>;
  let mockRedirect: jest.MockedFunction<typeof NextResponse.redirect>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = NextResponse.next as jest.MockedFunction<
      typeof NextResponse.next
    >;
    mockRedirect = NextResponse.redirect as jest.MockedFunction<
      typeof NextResponse.redirect
    >;
  });

  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    const request = {
      nextUrl: { pathname: new URL(url).pathname },
      url,
      headers: new Map(Object.entries(headers)),
      cookies: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as NextRequest;
    return request;
  };

  it('should export config with correct matcher', () => {
    expect(config).toEqual({
      matcher: ['/admin/:path*', '/api/:path*'],
    });
  });

  it('should pass through non-API routes without rate limiting', async () => {
    const request = createMockRequest('http://localhost:3000/');
    const mockResponse = { headers: new Map() };
    mockNext.mockReturnValue(mockResponse as unknown as NextResponse);

    await middleware(request);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should apply rate limiting to API routes', async () => {
    const request = createMockRequest('http://localhost:3000/api/test', {
      'x-forwarded-for': '192.168.1.1',
    });
    const mockResponse = { headers: new Map() };
    mockNext.mockReturnValue(mockResponse as unknown as NextResponse);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.headers.get('x-api-call-track')).toBe('true');
  });

  it('should handle admin routes with valid auth token', async () => {
    const request = createMockRequest('http://localhost:3000/admin/dashboard');
    request.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });

    const mockResponse = { headers: new Map() };
    mockNext.mockReturnValue(mockResponse as unknown as NextResponse);

    // Mock fetch for auth verification
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, user: { id: 1 } }),
    });

    await middleware(request);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should redirect admin routes without auth token', async () => {
    const request = createMockRequest('http://localhost:3000/admin/dashboard');
    const mockRedirectResponse = { headers: new Map() };
    mockRedirect.mockReturnValue(
      mockRedirectResponse as unknown as NextResponse
    );

    await middleware(request);
    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should handle auth verification errors gracefully', async () => {
    const request = createMockRequest('http://localhost:3000/admin/dashboard');
    request.cookies.get = jest.fn().mockReturnValue({ value: 'invalid-token' });

    const mockRedirectResponse = { headers: new Map() };
    mockRedirect.mockReturnValue(
      mockRedirectResponse as unknown as NextResponse
    );

    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await middleware(request);
    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should allow admin login page without auth', async () => {
    const request = createMockRequest('http://localhost:3000/admin');
    const mockResponse = { headers: new Map() };
    mockNext.mockReturnValue(mockResponse as unknown as NextResponse);

    await middleware(request);
    expect(mockNext).toHaveBeenCalled();
  });
});
