import { NextRequest } from 'next/server';
import { setupApiMocks, clearApiMocks } from './mocks';

export interface ApiRouteTestConfig {
  routePath: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  mockConfig?: {
    authServiceUrl?: string;
    requireAuth?: boolean;
  };
}

export interface SuccessTestConfig {
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

export interface ErrorTestConfig {
  requestBody?: unknown;
  requestHeaders?: Record<string, string>;
  mockError: Error | Record<string, unknown>;
  expectedStatus: number;
  expectedError?: string;
}

export interface DatabaseErrorTestConfig {
  mockError: Error;
  expectedStatus: number;
  expectedError?: string;
}

export interface ValidationErrorTestConfig {
  requestBody: unknown;
  mockValidation: {
    success: false;
    error: string;
    details?: unknown[];
  };
  expectedStatus: number;
}

export class ApiRouteTestHelper {
  private routePath: string;
  private method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  private mockConfig: Record<string, unknown>;
  private routeHandler!: (request: NextRequest) => Promise<Response>;

  constructor(config: ApiRouteTestConfig) {
    this.routePath = config.routePath;
    this.method = config.method;
    this.mockConfig = config.mockConfig || {};
  }

  setupTest = async () => {
    jest.resetModules();
    setupApiMocks();

    // Setup common mocks
    if (this.mockConfig.authServiceUrl) {
      jest.mock('@/config/app', () => ({
        appConfig: {
          authServiceUrl: this.mockConfig.authServiceUrl,
        },
      }));
    }

    // Mock fetch globally
    global.fetch = jest.fn();

    // Import the route after mocks
    const route = await import(this.routePath);
    this.routeHandler = route[this.method];
  };

  cleanupTest = () => {
    clearApiMocks();
    jest.clearAllMocks();
  };

  createRequest = (
    body?: unknown,
    headers?: Record<string, string>
  ): NextRequest => {
    const request: Record<string, unknown> = {};

    if (body !== undefined) {
      request.json = jest.fn().mockResolvedValue(body);
    }

    if (headers) {
      request.headers = {
        get: jest.fn((key: string) => headers[key] || null),
      };
    }

    return request as unknown as NextRequest;
  };

  testSuccess = async (description: string, config: SuccessTestConfig) => {
    it(description, async () => {
      const mockFetchResponse = {
        json: jest.fn().mockResolvedValue(config.mockResponse),
        status: config.expectedStatus || 200,
        headers: new Headers(),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse);

      const request = this.createRequest(
        config.requestBody,
        config.requestHeaders
      );
      const response = await this.routeHandler(request);
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
  };

  testError = async (description: string, config: ErrorTestConfig) => {
    it(description, async () => {
      if (config.mockError instanceof Error) {
        (global.fetch as jest.Mock).mockRejectedValue(config.mockError);
      } else {
        (global.fetch as jest.Mock).mockResolvedValue({
          json: jest.fn().mockResolvedValue(config.mockError),
          status: config.expectedStatus,
          headers: new Headers(),
        });
      }

      const request = this.createRequest(
        config.requestBody,
        config.requestHeaders
      );
      const response = await this.routeHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(config.expectedStatus);
      if (config.expectedError) {
        expect(responseData.error).toBe(config.expectedError);
      }
    });
  };

  testDatabaseError = async (
    description: string,
    config: DatabaseErrorTestConfig
  ) => {
    it(description, async () => {
      // This would need to be customized based on the specific database operation
      // For now, we'll provide a generic pattern
      const request = this.createRequest();
      const response = await this.routeHandler(request);

      expect(response.status).toBe(config.expectedStatus);
      if (config.expectedError) {
        const responseData = await response.json();
        expect(responseData.error).toBe(config.expectedError);
      }
    });
  };

  testValidationError = async (
    description: string,
    config: ValidationErrorTestConfig
  ) => {
    it(description, async () => {
      // Mock validation to return error
      const validation = await import('@/lib/validation');
      validation.validateRequest = jest
        .fn()
        .mockReturnValue(config.mockValidation);

      const request = this.createRequest(config.requestBody);
      const response = await this.routeHandler(request);

      expect(response.status).toBe(config.expectedStatus);
    });
  };

  testMalformedJson = async (
    description: string,
    expectedStatus: number = 500
  ) => {
    it(description, async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await this.routeHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(expectedStatus);
      expect(responseData.success).toBe(false);
    });
  };

  testAuthenticationRequired = async (description: string) => {
    it(description, async () => {
      // Mock requireAuth to throw
      const auth = await import('@/lib/auth');
      auth.requireAuth = jest
        .fn()
        .mockRejectedValue(new Error('Authentication required'));

      const request = this.createRequest();
      const response = await this.routeHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Authentication');
    });
  };
}

export function createApiRouteTest(config: ApiRouteTestConfig) {
  const helper = new ApiRouteTestHelper(config);

  return {
    setupTest: helper.setupTest,
    cleanupTest: helper.cleanupTest,
    testSuccess: helper.testSuccess.bind(helper),
    testError: helper.testError.bind(helper),
    testDatabaseError: helper.testDatabaseError.bind(helper),
    testValidationError: helper.testValidationError.bind(helper),
    testMalformedJson: helper.testMalformedJson.bind(helper),
    testAuthenticationRequired: helper.testAuthenticationRequired.bind(helper),
    createRequest: helper.createRequest.bind(helper),
  };
}
