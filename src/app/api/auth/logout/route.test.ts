import mocks from '@/test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Import the route after mocks are set up.
const { POST } = jest.requireActual('./route');

// Mock console.error to prevent it from appearing in test output.
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

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

    it('still clears cookie even when auth service fails', async () => {
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
  });
});
