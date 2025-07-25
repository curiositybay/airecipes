import mocks from '../../../test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Mock PrismaClient using the mock architecture.
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mocks.mock.prisma.client),
}));

// Mock NextResponse using the mock architecture.
jest.mock('next/server', () => ({
  NextResponse: mocks.mock.next.mockNextResponse,
}));

describe('api/metadata/route', () => {
  let mockNextResponse: typeof mocks.mock.next.mockNextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponse = mocks.mock.next.mockNextResponse;
  });

  describe('GET', () => {
    it('returns metadata when found', async () => {
      const mockMetadata = {
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: new Date('2025-07-13T05:45:56.627Z'),
      };

      mocks.mock.prisma.client.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(mockMetadata);
      mockNextResponse.json = jest.fn().mockReturnValue({} as Response);

      // Import the route after setting up mocks.
      const { GET } = await import('./route');
      await GET();

      expect(
        mocks.mock.prisma.client.appMetadata.findFirst
      ).toHaveBeenCalledWith({
        orderBy: {
          lastDeployed: 'desc',
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: mockMetadata.lastDeployed,
      });
    });

    it('returns 404 when no metadata found', async () => {
      mocks.mock.prisma.client.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(null);
      mockNextResponse.json = jest.fn().mockReturnValue({} as Response);

      // Import the route after setting up mocks.
      const { GET } = await import('./route');
      await GET();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 404 }
      );
    });

    it('returns 500 when database error occurs', async () => {
      const error = new Error('Database connection failed');
      mocks.mock.prisma.client.appMetadata.findFirst = jest
        .fn()
        .mockRejectedValue(error);
      mockNextResponse.json = jest.fn().mockReturnValue({} as Response);

      // Import the route after setting up mocks.
      const { GET } = await import('./route');
      await GET();

      expect(mocks.mock.logger.instance.error).toHaveBeenCalledWith(
        'Failed to fetch metadata:',
        error
      );
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 500 }
      );
    });

    it('disconnects from database after operation', async () => {
      const mockMetadata = {
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: new Date(),
      };

      mocks.mock.prisma.client.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(mockMetadata);
      mockNextResponse.json = jest.fn().mockReturnValue({} as Response);

      // Import the route after setting up mocks.
      const { GET } = await import('./route');
      await GET();

      expect(mocks.mock.prisma.client.$disconnect).toHaveBeenCalled();
    });
  });
});
