import { NextResponse } from 'next/server';
import middleware, { config } from './middleware';
import mocks from './test-utils/mocks/mocks';

// Mock Next.js server modules before importing middleware
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ headers: new Map() })),
    redirect: jest.fn(() => ({ headers: new Map() })),
    json: jest.fn(),
  },
}));

describe('middleware', () => {
  let mockNext: jest.MockedFunction<typeof NextResponse.next>;
  let mockRedirect: jest.MockedFunction<typeof NextResponse.redirect>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked functions from the module
    mockNext = NextResponse.next as jest.MockedFunction<
      typeof NextResponse.next
    >;
    mockRedirect = NextResponse.redirect as jest.MockedFunction<
      typeof NextResponse.redirect
    >;
    mocks.setup.all();
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

  it('should redirect on admin route if auth check fails', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin/dashboard',
      {},
      'invalid-token'
    );
    const response = mocks.mock.next.createResponse();
    mockRedirect.mockReturnValue(response as unknown as NextResponse);

    mocks.mock.http.fetchFailure(mocks.mock.http.networkError);

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalled();
  });

  it('should allow admin login page without auth token', async () => {
    const request = mocks.mock.next.createRequest(
      'http://localhost:3000/admin'
    );
    const response = mocks.mock.next.createResponse();
    mockNext.mockReturnValue(response as unknown as NextResponse);

    await middleware(request);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should demonstrate rate limit mock usage', async () => {
    // Test that rate limit mocks are available and working
    mocks.mock.rateLimit.successResponse();

    const result = await mocks.mock.rateLimit.fn('test-identifier');

    expect(mocks.mock.rateLimit.fn).toHaveBeenCalledWith('test-identifier');
    expect(result).toEqual(mocks.mock.rateLimit.success);
  });
});
