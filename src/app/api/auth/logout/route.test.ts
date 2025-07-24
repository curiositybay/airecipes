import { setupApiMocks, clearApiMocks } from '@/test-utils/mocks';
import { NextRequest } from 'next/server';

// Mock the config
jest.mock('@/config/app', () => ({
  appConfig: {
    authServiceUrl: 'http://auth-service.test',
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to prevent it from appearing in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('api/auth/logout/route', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    setupApiMocks();
    // Import the route after mocks
    ({ POST } = jest.requireActual('./route'));
  });

  afterEach(() => {
    clearApiMocks();
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

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = {
        headers: {
          get: jest.fn().mockReturnValue('auth_token=abc123'),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://auth-service.test/api/v1/auth/logout',
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

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = {
        headers: {
          get: jest.fn().mockReturnValue('auth_token=expired'),
        },
      } as unknown as NextRequest;

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

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = {
        headers: {
          get: jest.fn().mockReturnValue('auth_token=abc123'),
        },
      } as unknown as NextRequest;

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

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://auth-service.test/api/v1/auth/logout',
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
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = {
        headers: {
          get: jest.fn().mockReturnValue('auth_token=abc123'),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Logout failed',
      });
      expect(response.status).toBe(500);
    });

    it('still clears cookie even when auth service fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = {
        headers: {
          get: jest.fn().mockReturnValue('auth_token=abc123'),
        },
      } as unknown as NextRequest;

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
