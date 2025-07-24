import { NextRequest } from 'next/server';

/**
 * Common test patterns and utilities for API route testing
 */

export interface MockFetchResponse {
  json: jest.Mock;
  status: number;
  headers: Headers;
}

export interface MockRequestConfig {
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Creates a mock fetch response
 */
export function createMockFetchResponse(
  data: unknown,
  status: number = 200,
  headers?: Record<string, string>
): MockFetchResponse {
  const mockHeaders = new Headers();
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      mockHeaders.set(key, value);
    });
  }

  return {
    json: jest.fn().mockResolvedValue(data),
    status,
    headers: mockHeaders,
  };
}

/**
 * Creates a mock NextRequest
 */
export function createMockRequest(config: MockRequestConfig = {}): NextRequest {
  const request: Record<string, unknown> = {};

  if (config.body !== undefined) {
    request.json = jest.fn().mockResolvedValue(config.body);
  }

  if (config.headers) {
    request.headers = {
      get: jest.fn((key: string) => config.headers![key] || null),
    };
  }

  return request as unknown as NextRequest;
}

/**
 * Common test patterns for API routes
 */
export const commonTestPatterns = {
  /**
   * Tests successful API response
   */
  testSuccess: (
    description: string,
    handler: (request: NextRequest) => Promise<Response>,
    config: {
      requestBody?: unknown;
      requestHeaders?: Record<string, string>;
      mockResponse: unknown;
      expectedStatus?: number;
      expectedFetchCall?: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: Record<string, unknown>;
      };
    }
  ) => {
    it(description, async () => {
      const mockFetchResponse = createMockFetchResponse(
        config.mockResponse,
        config.expectedStatus || 200
      );

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = createMockRequest({
        body: config.requestBody,
        headers: config.requestHeaders,
      });

      const response = await handler(request);
      const responseData = await response.json();

      // Verify fetch call if expected
      if (config.expectedFetchCall) {
        expect(global.fetch).toHaveBeenCalledWith(
          config.expectedFetchCall.url,
          expect.objectContaining({
            method: config.expectedFetchCall.method,
            ...(config.expectedFetchCall.headers && {
              headers: expect.objectContaining(
                config.expectedFetchCall.headers
              ),
            }),
            ...(config.expectedFetchCall.body && {
              body: JSON.stringify(config.expectedFetchCall.body),
            }),
          })
        );
      }

      expect(responseData).toEqual(config.mockResponse);
      expect(response.status).toBe(config.expectedStatus || 200);
    });
  },

  /**
   * Tests error handling
   */
  testError: (
    description: string,
    handler: (request: NextRequest) => Promise<Response>,
    config: {
      requestBody?: unknown;
      requestHeaders?: Record<string, string>;
      mockError: Error | Record<string, unknown>;
      expectedStatus: number;
      expectedError?: string;
    }
  ) => {
    it(description, async () => {
      if (config.mockError instanceof Error) {
        (global.fetch as jest.Mock).mockRejectedValue(config.mockError);
      } else {
        (global.fetch as jest.Mock).mockResolvedValue(
          createMockFetchResponse(config.mockError, config.expectedStatus)
        );
      }

      const request = createMockRequest({
        body: config.requestBody,
        headers: config.requestHeaders,
      });

      const response = await handler(request);
      const responseData = await response.json();

      expect(response.status).toBe(config.expectedStatus);
      if (config.expectedError) {
        expect(responseData.error).toBe(config.expectedError);
      }
    });
  },

  /**
   * Tests malformed JSON handling
   */
  testMalformedJson: (
    description: string,
    handler: (request: NextRequest) => Promise<Response>,
    expectedStatus: number = 500
  ) => {
    it(description, async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await handler(request);
      const responseData = await response.json();

      expect(response.status).toBe(expectedStatus);
      expect(responseData.success).toBe(false);
    });
  },

  /**
   * Tests database error handling
   */
  testDatabaseError: (
    description: string,
    handler: (request: NextRequest) => Promise<Response>,
    config: {
      mockError: Error;
      expectedStatus: number;
      expectedError?: string;
    }
  ) => {
    it(description, async () => {
      const request = createMockRequest();
      const response = await handler(request);

      expect(response.status).toBe(config.expectedStatus);
      if (config.expectedError) {
        const responseData = await response.json();
        expect(responseData.error).toBe(config.expectedError);
      }
    });
  },
};

/**
 * Common setup for API route tests
 */
export function setupApiRouteTest(config: {
  authServiceUrl?: string;
  mockFetch?: boolean;
}) {
  if (config.authServiceUrl) {
    jest.mock('@/config/app', () => ({
      appConfig: {
        authServiceUrl: config.authServiceUrl,
      },
    }));
  }

  if (config.mockFetch !== false) {
    global.fetch = jest.fn();
  }

  // Mock console.error to prevent it from appearing in test output
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });
}
