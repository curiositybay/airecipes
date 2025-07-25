import mocks from '@/test-utils/mocks/mocks';
import { NextRequest } from 'next/server';

// Setup mocks before importing anything.
mocks.setup.all();

// Mock the config using the mock architecture.
jest.mock('@/config/app', () => ({
  appConfig: mocks.mock.config.app,
}));

describe('api/auth/login/route', () => {
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
    it('proxies login request to auth service successfully', async () => {
      const mockResponse = { success: true, token: 'test-token' };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      const request = {
        json: jest.fn().mockResolvedValue(requestBody),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-auth-service/api/v1/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      expect(responseData).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('handles auth service errors with appropriate status code', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Invalid credentials',
      };
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockErrorResponse),
        status: 401,
        headers: new Headers(),
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest
          .fn()
          .mockResolvedValue({ email: 'test@example.com', password: 'wrong' }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual(mockErrorResponse);
      expect(response.status).toBe(401);
    });

    it('modifies cookie domain when set-cookie header is present', async () => {
      const mockResponse = { success: true };
      const mockHeaders = new Headers();
      mockHeaders.set(
        'set-cookie',
        'session=abc123; Domain=auth.example.com; Path=/; HttpOnly'
      );

      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(mockResponse),
        status: 200,
        headers: mockHeaders,
      };

      mocks.mock.http.fetchSuccess(mockFetchResponse);

      const request = {
        json: jest.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'password123',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBe('session=abc123; Path=/; HttpOnly');
      expect(setCookieHeader).not.toContain('Domain=');
    });

    it('handles fetch errors gracefully', async () => {
      mocks.mock.http.fetchFailure(new Error('Network error'));

      const request = {
        json: jest.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'password123',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Login failed',
      });
      expect(response.status).toBe(500);
    });

    it('handles malformed JSON in request body', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(responseData).toEqual({
        success: false,
        error: 'Login failed',
      });
      expect(response.status).toBe(500);
    });
  });
});
