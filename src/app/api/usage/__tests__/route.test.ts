// Mock dependencies before importing the logic
jest.mock('../../../../lib/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock validation
jest.mock('../../../../lib/validation', () => ({
  ...jest.requireActual('../../../../lib/validation'),
  validateRequest: jest.fn(),
}));

import {
  setupApiMocks,
  clearApiMocks,
  mockPrismaClient,
} from '../../../../test-utils/mocks';
import * as validation from '../../../../lib/validation';

describe('Usage Route Business Logic', () => {
  let getUsageLogs: jest.MockedFunction<(...args: unknown[]) => unknown>;
  let createUsageLog: jest.MockedFunction<(...args: unknown[]) => unknown>;
  let GET: (request: unknown) => Promise<Response>;
  let POST: (request: unknown) => Promise<Response>;
  let validateRequest: jest.MockedFunction<(...args: unknown[]) => unknown>;

  beforeEach(() => {
    setupApiMocks();
    // Import logic after mocks
    ({ getUsageLogs, createUsageLog } = jest.requireActual('../logic'));
    ({ GET, POST } = jest.requireActual('../route'));
    validateRequest = validation.validateRequest as jest.Mock;
  });

  afterEach(() => {
    clearApiMocks();
    jest.clearAllMocks();
  });

  // Test that route handlers can be imported (covers import statements)
  it('can import route handlers', () => {
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });

  describe('GET handler', () => {
    it('should handle GET request with default pagination', async () => {
      const mockUsageLogs = [
        { id: 1, method: 'GET', success: true, createdAt: new Date() },
        {
          id: 2,
          method: 'POST',
          success: false,
          createdAt: new Date(),
        },
      ];

      mockPrismaClient.usageLog.findMany.mockResolvedValue(mockUsageLogs);
      mockPrismaClient.usageLog.count.mockResolvedValue(2);

      // Mock NextRequest
      const mockRequest = {
        url: 'http://localhost:3000/api/usage',
      };

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(mockPrismaClient.usageLog.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      expect(data).toEqual({
        success: true,
        data: mockUsageLogs,
        pagination: {
          total: 2,
          limit: 50,
          offset: 0,
        },
      });
    });

    it('should handle GET request with custom pagination', async () => {
      const mockUsageLogs = [
        { id: 1, method: 'GET', success: true, createdAt: new Date() },
      ];

      mockPrismaClient.usageLog.findMany.mockResolvedValue(mockUsageLogs);
      mockPrismaClient.usageLog.count.mockResolvedValue(1);

      // Mock NextRequest with query parameters
      const mockRequest = {
        url: 'http://localhost:3000/api/usage?limit=10&offset=5',
      };

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(mockPrismaClient.usageLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(data).toEqual({
        success: true,
        data: mockUsageLogs,
        pagination: {
          total: 1,
          limit: 10,
          offset: 5,
        },
      });
    });

    it('should handle database errors in GET', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.usageLog.findMany.mockRejectedValue(error);

      const mockRequest = {
        url: 'http://localhost:3000/api/usage',
      };

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch usage logs',
      });
      expect(response.status).toBe(500);
    });
  });

  describe('POST handler', () => {
    it('should handle POST request with valid data', async () => {
      const mockUsageLog = {
        id: 1,
        method: 'GET',
        success: true,
        errorMessage: null,
        createdAt: new Date(),
      };

      mockPrismaClient.usageLog.create.mockResolvedValue(mockUsageLog);
      validateRequest.mockReturnValue({
        success: true,
        data: { method: 'GET', success: true, errorMessage: null },
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          method: 'GET',
          success: true,
        }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(validateRequest).toHaveBeenCalledWith(
        expect.any(Object), // createUsageLogSchema
        { method: 'GET', success: true }
      );
      expect(mockPrismaClient.usageLog.create).toHaveBeenCalledWith({
        data: {
          method: 'GET',
          success: true,
          errorMessage: null,
        },
      });
      expect(data).toEqual({
        success: true,
        data: mockUsageLog,
      });
      expect(response.status).toBe(201);
    });

    it('should handle POST request with validation error', async () => {
      // Ensure the mock is properly set up
      const mockValidateRequest =
        validation.validateRequest as jest.MockedFunction<
          typeof validation.validateRequest
        >;
      mockValidateRequest.mockReturnValue({
        success: false,
        error: 'Invalid request data',
        details: [
          {
            field: 'method',
            message: 'Invalid request data',
            code: 'invalid_type',
          },
        ],
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          method: 'INVALID',
          success: 'not-a-boolean',
        }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockValidateRequest).toHaveBeenCalled();
      expect(data).toEqual({
        success: false,
        error: 'Invalid request data',
      });
      expect(response.status).toBe(400);
    });

    it('should handle POST request with database error', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.usageLog.create.mockRejectedValue(error);
      validateRequest.mockReturnValue({
        success: true,
        data: {
          method: 'POST',
          success: false,
          errorMessage: 'Test error',
        },
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          method: 'POST',
          success: false,
          errorMessage: 'Test error',
        }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to create usage log',
      });
      expect(response.status).toBe(500);
    });

    it('should handle JSON parsing error in POST', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to create usage log',
      });
      expect(response.status).toBe(500);
    });
  });

  describe('getUsageLogs', () => {
    it('should fetch usage logs with pagination', async () => {
      const mockUsageLogs = [
        { id: 1, method: 'GET', success: true, createdAt: new Date() },
        {
          id: 2,
          method: 'POST',
          success: false,
          createdAt: new Date(),
        },
      ];

      mockPrismaClient.usageLog.findMany.mockResolvedValue(mockUsageLogs);
      mockPrismaClient.usageLog.count.mockResolvedValue(2);

      const result = await getUsageLogs(50, 0);

      expect(mockPrismaClient.usageLog.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaClient.usageLog.count).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockUsageLogs,
        pagination: {
          total: 2,
          limit: 50,
          offset: 0,
        },
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.usageLog.findMany.mockRejectedValue(error);

      await expect(getUsageLogs(50, 0)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('createUsageLog', () => {
    it('should create a usage log successfully', async () => {
      const mockUsageLog = {
        id: 1,
        method: 'GET',
        success: true,
        errorMessage: null,
        createdAt: new Date(),
      };

      mockPrismaClient.usageLog.create.mockResolvedValue(mockUsageLog);

      const result = await createUsageLog('GET', true);

      expect(mockPrismaClient.usageLog.create).toHaveBeenCalledWith({
        data: {
          method: 'GET',
          success: true,
          errorMessage: null,
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockUsageLog,
      });
    });

    it('should create usage log with error message when success is false', async () => {
      const mockUsageLog = {
        id: 1,
        method: 'POST',
        success: false,
        errorMessage: 'Validation failed',
        createdAt: new Date(),
      };

      mockPrismaClient.usageLog.create.mockResolvedValue(mockUsageLog);

      const result = await createUsageLog('POST', false, 'Validation failed');

      expect(mockPrismaClient.usageLog.create).toHaveBeenCalledWith({
        data: {
          method: 'POST',
          success: false,
          errorMessage: 'Validation failed',
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockUsageLog,
      });
    });
  });
});
