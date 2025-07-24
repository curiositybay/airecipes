import { NextRequest } from 'next/server';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { setupApiMocks, clearApiMocks } from './mocks';

const mockPrismaClient = mockDeep<PrismaClient>();

export interface DatabaseRouteTestConfig {
  routePath: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface DatabaseSuccessTestConfig {
  requestBody?: unknown;
  mockData: unknown;
  expectedStatus?: number;
  expectedResponse: unknown;
  prismaCall?: {
    method: string;
    args?: unknown;
  };
}

export interface DatabaseErrorTestConfig {
  requestBody?: unknown;
  mockError: Error;
  expectedStatus: number;
  expectedError?: string;
  prismaCall?: {
    method: string;
    args?: unknown;
  };
}

export class DatabaseRouteTestHelper {
  private routePath: string;
  private method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  private routeHandler!: (request: NextRequest) => Promise<Response>;

  constructor(config: DatabaseRouteTestConfig) {
    this.routePath = config.routePath;
    this.method = config.method;
  }

  setupTest = async () => {
    jest.resetModules();
    setupApiMocks();

    // Mock Prisma
    jest.mock('@/lib/prisma', () => ({
      prisma: mockPrismaClient,
    }));

    // Mock logger
    jest.mock('@/lib/logger', () => ({
      __esModule: true,
      default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    }));

    // Mock console.error to prevent it from appearing in test output
    const originalConsoleError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    // Import the route after mocks
    const route = await import(this.routePath);
    this.routeHandler = route[this.method];
  };

  cleanupTest = () => {
    clearApiMocks();
    jest.clearAllMocks();
  };

  createRequest = (body?: unknown): NextRequest => {
    const request: Record<string, unknown> = {};

    if (body !== undefined) {
      request.json = jest.fn().mockResolvedValue(body);
    }

    return request as unknown as NextRequest;
  };

  testSuccess = async (
    description: string,
    config: DatabaseSuccessTestConfig
  ) => {
    it(description, async () => {
      // Mock Prisma call
      if (config.prismaCall) {
        const { method, args } = config.prismaCall;
        const mockMethod = mockPrismaClient[method as keyof PrismaClient] as {
          mockResolvedValue: (value: unknown) => void;
        };
        if (args) {
          mockMethod.mockResolvedValue(config.mockData);
        } else {
          mockMethod.mockResolvedValue(config.mockData);
        }
      }

      const request = this.createRequest(config.requestBody);
      const response = await this.routeHandler(request);
      const responseData = await response.json();

      expect(responseData).toEqual(config.expectedResponse);
      expect(response.status).toBe(config.expectedStatus || 200);
    });
  };

  testDatabaseError = async (
    description: string,
    config: DatabaseErrorTestConfig
  ) => {
    it(description, async () => {
      // Mock Prisma call to throw error
      if (config.prismaCall) {
        const { method } = config.prismaCall;
        const mockMethod = mockPrismaClient[method as keyof PrismaClient] as {
          mockRejectedValue: (error: Error) => void;
        };
        mockMethod.mockRejectedValue(config.mockError);
      }

      const request = this.createRequest(config.requestBody);
      const response = await this.routeHandler(request);
      const responseData = await response.json();

      expect(response.status).toBe(config.expectedStatus);
      if (config.expectedError) {
        expect(responseData.error).toBe(config.expectedError);
      }
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

  testValidationError = async (
    description: string,
    config: {
      requestBody: unknown;
      mockValidation: { success: false; error: string; details?: unknown[] };
      expectedStatus: number;
    }
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
}

export function createDatabaseRouteTest(config: DatabaseRouteTestConfig) {
  const helper = new DatabaseRouteTestHelper(config);

  return {
    setupTest: helper.setupTest,
    cleanupTest: helper.cleanupTest,
    testSuccess: helper.testSuccess.bind(helper),
    testDatabaseError: helper.testDatabaseError.bind(helper),
    testMalformedJson: helper.testMalformedJson.bind(helper),
    testValidationError: helper.testValidationError.bind(helper),
    createRequest: helper.createRequest.bind(helper),
    mockPrismaClient,
  };
}
