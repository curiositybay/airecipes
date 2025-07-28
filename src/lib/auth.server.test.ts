/**
 * @jest-environment node
 */

/**
 * Server-side only tests for the auth module.
 *
 * These tests verify that authentication functions work correctly
 * when running in a Node environment where window is undefined.
 */
import { NextRequest } from 'next/server';
import { verifyAuth, requireAuth, loginAsDemoUser } from './auth';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock console.error
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('auth Server-Side Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
    mockConsoleError.mockRestore();
  });

  // Helper functions to reduce repetition
  const createMockRequest = (cookies: unknown, headers: unknown): NextRequest =>
    ({
      cookies: { get: jest.fn().mockReturnValue(cookies) },
      headers: { get: jest.fn().mockReturnValue(headers) },
    }) as unknown as NextRequest;

  const mockSuccessfulResponse = (user: {
    id: string;
    email: string;
    role: string;
    app_name: string;
  }) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        user,
      }),
    });
  };

  const mockFailedResponse = (
    ok: boolean = false,
    json?: { success: boolean; user: unknown }
  ) => {
    mockFetch.mockResolvedValueOnce({
      ok,
      json: json ? jest.fn().mockResolvedValue(json) : undefined,
    });
  };

  const mockNetworkError = () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
  };

  describe('verifyAuth', () => {
    it('should handle different authentication scenarios', async () => {
      // No auth token
      const noTokenResult = await verifyAuth(createMockRequest(null, null));
      expect(noTokenResult).toEqual({
        success: false,
        error: 'No authentication token provided',
      });

      // Auth token from cookies
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        app_name: 'airecipes',
      };

      mockSuccessfulResponse(mockUser);
      const cookieResult = await verifyAuth(
        createMockRequest({ value: 'cookie-token' }, null)
      );
      expect(cookieResult).toEqual({
        success: true,
        user: mockUser,
      });

      // Auth token from headers
      mockSuccessfulResponse(mockUser);
      const headerResult = await verifyAuth(
        createMockRequest(null, 'Bearer header-token')
      );
      expect(headerResult.success).toBe(true);

      // Invalid response
      mockFailedResponse(false);
      const invalidResponseResult = await verifyAuth(
        createMockRequest({ value: 'token' }, null)
      );
      expect(invalidResponseResult).toEqual({
        success: false,
        error: 'Invalid or expired authentication token',
      });

      // Unsuccessful auth response
      mockFailedResponse(true, { success: false, user: null });
      const unsuccessfulResult = await verifyAuth(
        createMockRequest({ value: 'token' }, null)
      );
      expect(unsuccessfulResult).toEqual({
        success: false,
        error: 'Authentication verification failed',
      });

      // Network error
      mockNetworkError();
      const errorResult = await verifyAuth(
        createMockRequest({ value: 'token' }, null)
      );
      expect(errorResult).toEqual({
        success: false,
        error: 'Authentication service unavailable',
      });
    });
  });

  describe('requireAuth', () => {
    it('should handle different auth scenarios', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        app_name: 'airecipes',
      };

      // Successful auth
      mockSuccessfulResponse(mockUser);
      const successResult = await requireAuth(
        createMockRequest({ value: 'token' }, null)
      );
      expect(successResult.success).toBe(true);

      // Failed auth
      mockFailedResponse(false);
      await expect(
        requireAuth(createMockRequest({ value: 'token' }, null))
      ).rejects.toThrow('Invalid or expired authentication token');

      // Network error
      mockNetworkError();
      await expect(
        requireAuth(createMockRequest({ value: 'token' }, null))
      ).rejects.toThrow('Authentication service unavailable');
    });
  });

  describe('loginAsDemoUser', () => {
    it('should handle different login scenarios', async () => {
      const mockUser = {
        id: 'demo-123',
        email: 'demo@example.com',
        role: 'admin',
        app_name: 'airecipes',
      };

      // Successful login
      mockSuccessfulResponse(mockUser);
      const successResult = await loginAsDemoUser();
      expect(successResult).toEqual({
        success: true,
        user: mockUser,
      });

      // Missing AUTH_SERVICE_URL
      delete process.env.AUTH_SERVICE_URL;
      jest.resetModules();
      const { loginAsDemoUser: freshLoginAsDemoUser } = await import('./auth');
      const missingConfigResult = await freshLoginAsDemoUser();
      expect(missingConfigResult).toEqual({
        success: false,
        error: 'Demo login failed',
      });

      // Client-side environment error
      const originalWindow = global.window;
      (global as { window?: unknown }).window = {};
      jest.resetModules();
      const { loginAsDemoUser: clientSideLoginAsDemoUser } = await import(
        './auth'
      );
      const clientSideResult = await clientSideLoginAsDemoUser();
      expect(clientSideResult).toEqual({
        success: false,
        error: 'Demo login failed',
      });
      global.window = originalWindow;

      // Failed login scenarios
      const failedScenarios = [
        {
          mock: () => mockFailedResponse(false),
          expectedError: 'Demo login failed',
        },
        {
          mock: () => mockFailedResponse(true, { success: false, user: null }),
          expectedError: 'Demo login failed',
        },
        { mock: () => mockNetworkError(), expectedError: 'Demo login failed' },
      ];

      for (const scenario of failedScenarios) {
        scenario.mock();
        const result = await loginAsDemoUser();
        expect(result).toEqual({
          success: false,
          error: scenario.expectedError,
        });
      }
    });
  });
});
