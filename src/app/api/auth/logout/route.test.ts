import mocks from '@/test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Import the route after mocks are set up.
const { POST } = jest.requireActual('./route');

describe('api/auth/logout/route', () => {
  beforeEach(() => {
    mocks.setup.all();
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('proxies logout request to auth service successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'abc123'
      );

      const response = await POST(request);
      const responseData = await response.json();

      // Check that fetch was called with the expected parameters.
      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'auth_token=abc123',
          },
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('handles auth service errors with appropriate status code', async () => {
      const mockErrorResponse = { success: false, error: 'Session expired' };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockErrorResponse),
        status: 401,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'expired'
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual(mockErrorResponse);
      expect(response.status).toBe(401);
    });

    it('always clears auth_token cookie regardless of auth service response', async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'abc123'
      );

      const response = await POST(request);
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBe(
        'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
      );
    });

    it('handles request without cookie header', async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout'
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: '',
          },
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('handles fetch errors gracefully', async () => {
      mocks.mock.http.fetchFailure(new Error('Network error'));

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'abc123'
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Logout failed',
      });
      expect(response.status).toBe(500);
    });

    it('handles cache invalidation errors gracefully', async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      // Mock the auth-cache module to throw an error during cache invalidation.
      const mockInvalidateUserAuthCache = jest
        .fn()
        .mockRejectedValue(new Error('Cache service unavailable'));
      const mockExtractUserIdFromToken = jest.fn().mockReturnValue('user123');

      jest.mock('@/lib/auth-cache', () => ({
        invalidateUserAuthCache: mockInvalidateUserAuthCache,
        extractUserIdFromToken: mockExtractUserIdFromToken,
      }));

      // Re-import the route to get the mocked version.
      jest.resetModules();
      const { POST: POSTHandler } = await import('./route');

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'abc123'
      );

      const response = await POSTHandler(request);
      const responseData = await response.json();

      // Verify the logout still succeeds despite cache error.
      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);

      // Verify cache invalidation was attempted.
      expect(mockInvalidateUserAuthCache).toHaveBeenCalledWith(
        'mock-app',
        'user123'
      );
    });

    it('handles cache invalidation errors with non-Error objects', async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      // Mock the auth-cache module to throw a non-Error object.
      const mockInvalidateUserAuthCache = jest
        .fn()
        .mockRejectedValue('String error message');
      const mockExtractUserIdFromToken = jest.fn().mockReturnValue('user456');

      jest.mock('@/lib/auth-cache', () => ({
        invalidateUserAuthCache: mockInvalidateUserAuthCache,
        extractUserIdFromToken: mockExtractUserIdFromToken,
      }));

      // Re-import the route to get the mocked version.
      jest.resetModules();
      const { POST: POSTHandler } = await import('./route');

      const request = mocks.mock.next.createRequest(
        'http://localhost:3000/api/auth/logout',
        {},
        'abc123'
      );

      const response = await POSTHandler(request);
      const responseData = await response.json();

      // Verify the logout still succeeds despite cache error.
      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);

      // Verify cache invalidation was attempted.
      expect(mockInvalidateUserAuthCache).toHaveBeenCalledWith(
        'mock-app',
        'user456'
      );
    });
  });
});
