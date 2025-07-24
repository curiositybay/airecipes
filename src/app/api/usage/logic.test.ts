import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const mockPrismaClient = mockDeep<PrismaClient>();

jest.mock('../../../lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

describe('usage/logic', () => {
  let getUsageLogs: (
    limit: number,
    offset: number
  ) => Promise<{
    success: boolean;
    data: Array<{
      id: number;
      method: string;
      success: boolean;
      errorMessage: string | null;
      createdAt: Date;
    }>;
    pagination: { total: number; limit: number; offset: number };
  }>;
  let createUsageLog: (
    method: string,
    success: boolean,
    errorMessage?: string
  ) => Promise<{
    success: boolean;
    data: {
      id: number;
      method: string;
      success: boolean;
      errorMessage: string | null;
      createdAt: Date;
    };
  }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Import logic after mocks
    const logic = await import('./logic');
    getUsageLogs = logic.getUsageLogs;
    createUsageLog = logic.createUsageLog;
  });

  describe('getUsageLogs', () => {
    it('retrieves usage logs with pagination', async () => {
      const mockUsageLogs = [
        {
          id: 1,
          method: 'GET',
          success: true,
          errorMessage: null,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z'),
        },
        {
          id: 2,
          method: 'POST',
          success: false,
          errorMessage: 'Validation error',
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];

      mockPrismaClient.usageLog.findMany.mockResolvedValue(mockUsageLogs);
      mockPrismaClient.usageLog.count.mockResolvedValue(2);

      const result = await getUsageLogs(10, 0);

      expect(mockPrismaClient.usageLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockPrismaClient.usageLog.count).toHaveBeenCalledWith();

      expect(result).toEqual({
        success: true,
        data: mockUsageLogs,
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
        },
      });
    });

    it('handles empty result set', async () => {
      mockPrismaClient.usageLog.findMany.mockResolvedValue([]);
      mockPrismaClient.usageLog.count.mockResolvedValue(0);

      const result = await getUsageLogs(5, 10);

      expect(mockPrismaClient.usageLog.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit: 5,
          offset: 10,
        },
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.usageLog.findMany.mockRejectedValue(error);

      await expect(getUsageLogs(10, 0)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('createUsageLog', () => {
    it('creates successful usage log', async () => {
      const mockUsageLog = {
        id: 1,
        method: 'GET',
        success: true,
        errorMessage: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
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

    it('creates failed usage log with error message', async () => {
      const mockUsageLog = {
        id: 2,
        method: 'POST',
        success: false,
        errorMessage: 'Validation failed',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
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

    it('creates failed usage log without error message', async () => {
      const mockUsageLog = {
        id: 3,
        method: 'DELETE',
        success: false,
        errorMessage: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      mockPrismaClient.usageLog.create.mockResolvedValue(mockUsageLog);

      const result = await createUsageLog('DELETE', false);

      expect(mockPrismaClient.usageLog.create).toHaveBeenCalledWith({
        data: {
          method: 'DELETE',
          success: false,
          errorMessage: undefined,
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockUsageLog,
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.usageLog.create.mockRejectedValue(error);

      await expect(createUsageLog('GET', true)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
