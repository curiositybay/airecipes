import mocks from '@/test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Mock PrismaClient using the mock architecture.
jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
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
    // Import logic after mocks.
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

      mocks.mock.prisma.client.usageLog.findMany.mockResolvedValue(
        mockUsageLogs
      );
      mocks.mock.prisma.client.usageLog.count.mockResolvedValue(2);

      const result = await getUsageLogs(10, 0);

      expect(mocks.mock.prisma.client.usageLog.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(mocks.mock.prisma.client.usageLog.count).toHaveBeenCalledWith();

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

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mocks.mock.prisma.client.usageLog.findMany.mockRejectedValue(error);

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

      mocks.mock.prisma.client.usageLog.create.mockResolvedValue(mockUsageLog);

      const result = await createUsageLog('GET', true);

      expect(mocks.mock.prisma.client.usageLog.create).toHaveBeenCalledWith({
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

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mocks.mock.prisma.client.usageLog.create.mockRejectedValue(error);

      await expect(createUsageLog('GET', true)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
