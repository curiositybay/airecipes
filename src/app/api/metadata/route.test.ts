import { NextResponse } from 'next/server';

// Mock PrismaClient
const mockPrismaClient = {
  appMetadata: {
    findFirst: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('api/metadata/route', () => {
  let mockNextResponse: jest.Mocked<typeof NextResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
  });

  describe('GET', () => {
    it('returns metadata when found', async () => {
      const mockMetadata = {
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: new Date('2025-07-13T05:45:56.627Z'),
      };

      mockPrismaClient.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(mockMetadata);
      mockNextResponse.json = jest.fn().mockReturnValue({} as NextResponse);

      // Import the route after setting up mocks
      const { GET } = await import('./route');
      await GET();

      expect(mockPrismaClient.appMetadata.findFirst).toHaveBeenCalledWith({
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
      mockPrismaClient.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(null);
      mockNextResponse.json = jest.fn().mockReturnValue({} as NextResponse);

      // Import the route after setting up mocks
      const { GET } = await import('./route');
      await GET();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 404 }
      );
    });

    it('returns 500 when database error occurs', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.appMetadata.findFirst = jest
        .fn()
        .mockRejectedValue(error);
      mockNextResponse.json = jest.fn().mockReturnValue({} as NextResponse);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Import the route after setting up mocks
      const { GET } = await import('./route');
      await GET();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch metadata:',
        error
      );
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 500 }
      );

      consoleSpy.mockRestore();
    });

    it('disconnects from database after operation', async () => {
      const mockMetadata = {
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: new Date(),
      };

      mockPrismaClient.appMetadata.findFirst = jest
        .fn()
        .mockResolvedValue(mockMetadata);
      mockNextResponse.json = jest.fn().mockReturnValue({} as NextResponse);

      // Import the route after setting up mocks
      const { GET } = await import('./route');
      await GET();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });
  });
});
