import mocks from '@/test-utils/mocks/mocks';
import { NextRequest } from 'next/server';

// Setup mocks before importing anything.
mocks.setup.all();

describe('api/auth/verify/route', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    mocks.setup.all();
    // Import the route after mocks.
    ({ POST } = jest.requireActual('./route'));
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('returns 401 when no authentication credentials are provided', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'No authentication credentials provided',
      });
      expect(response.status).toBe(401);
    });

    it('uses auth token from cookies when available', async () => {
      const mockResponse = {
        success: true,
        user: { id: 1, email: 'test@example.com' },
      };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'cookie-token-123' }),
        },
        headers: {
          get: jest.fn().mockReturnValue('Bearer header-token-456'),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer cookie-token-123',
            Cookie: 'Bearer header-token-456',
          },
          body: JSON.stringify({}),
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('uses auth token from authorization header when cookies not available', async () => {
      const mockResponse = {
        success: true,
        user: { id: 1, email: 'test@example.com' },
      };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        headers: {
          get: jest.fn().mockReturnValue('Bearer header-token-456'),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer header-token-456',
            Cookie: 'Bearer header-token-456',
          },
          body: JSON.stringify({}),
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('returns 401 when JWT token is expired', async () => {
      // Create an expired JWT token (exp: 1000000000 = 2001-09-09).
      const expiredPayload = Buffer.from(
        JSON.stringify({ exp: 1000000000 })
      ).toString('base64');
      const expiredJWT = `header.${expiredPayload}.signature`;

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue({ value: expiredJWT }),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Authentication token expired',
      });
      expect(response.status).toBe(401);
    });

    it('proceeds with auth service call when JWT token is valid', async () => {
      // Create a valid JWT token (exp: 9999999999 = 2286-11-20).
      const validPayload = Buffer.from(
        JSON.stringify({ exp: 9999999999 })
      ).toString('base64');
      const validJWT = `header.${validPayload}.signature`;

      const mockResponse = {
        success: true,
        user: { id: 1, email: 'test@example.com' },
      };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue({ value: validJWT }),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validJWT}`,
          },
          body: JSON.stringify({}),
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('handles auth service errors with appropriate status code', async () => {
      const mockErrorResponse = { success: false, error: 'Invalid token' };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockErrorResponse),
        status: 401,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual(mockErrorResponse);
      expect(response.status).toBe(401);
    });

    it('handles fetch errors gracefully', async () => {
      mocks.mock.http.fetchFailure(new Error('Network error'));

      const request = {
        json: jest.fn().mockResolvedValue({}),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Verification failed',
      });
      expect(response.status).toBe(500);
    });

    it('handles malformed JSON in request body', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Verification failed',
      });
      expect(response.status).toBe(500);
    });
  });
});
