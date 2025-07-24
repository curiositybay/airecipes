import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const mockPrismaClient = mockDeep<PrismaClient>();

// Types for the utility functions
type ExampleData = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateExampleResult = {
  success: boolean;
  data: ExampleData;
};

type DeleteExampleResult = {
  success: boolean;
};

type GetExamplesResult = {
  success: boolean;
  data: ExampleData[];
  count: number;
};

type CreateExampleResult = {
  success: boolean;
  data: ExampleData;
};

describe('exampleUtils', () => {
  let updateExample: (
    prisma: PrismaClient,
    id: number,
    data: Record<string, unknown>
  ) => Promise<UpdateExampleResult>;
  let deleteExample: (
    prisma: PrismaClient,
    id: number
  ) => Promise<DeleteExampleResult>;
  let getExamples: (prisma: PrismaClient) => Promise<GetExamplesResult>;
  let createExample: (
    prisma: PrismaClient,
    name: string,
    description?: string
  ) => Promise<CreateExampleResult>;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Import logic after mocks
    const utils = await import('./exampleUtils');
    updateExample = utils.updateExample;
    deleteExample = utils.deleteExample;
    getExamples = utils.getExamples;
    createExample = utils.createExample;
  });

  describe('updateExample', () => {
    it('updates example successfully', async () => {
      const mockExample = {
        id: 1,
        name: 'Updated Example',
        description: 'Updated description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      mockPrismaClient.example.update.mockResolvedValue(mockExample);

      const result = await updateExample(mockPrismaClient, 1, {
        name: 'Updated Example',
        description: 'Updated description',
      });

      expect(mockPrismaClient.example.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Example',
          description: 'Updated description',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockExample,
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.example.update.mockRejectedValue(error);

      await expect(
        updateExample(mockPrismaClient, 1, { name: 'Test' })
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('deleteExample', () => {
    it('deletes example successfully', async () => {
      mockPrismaClient.example.delete.mockResolvedValue({
        id: 1,
        name: 'Test',
        description: 'Test',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deleteExample(mockPrismaClient, 1);

      expect(mockPrismaClient.example.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual({
        success: true,
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.example.delete.mockRejectedValue(error);

      await expect(deleteExample(mockPrismaClient, 1)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getExamples', () => {
    it('retrieves active examples successfully', async () => {
      const mockExamples = [
        {
          id: 1,
          name: 'Example 1',
          description: 'Description 1',
          isActive: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z'),
        },
        {
          id: 2,
          name: 'Example 2',
          description: 'Description 2',
          isActive: true,
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];

      mockPrismaClient.example.findMany.mockResolvedValue(mockExamples);

      const result = await getExamples(mockPrismaClient);

      expect(mockPrismaClient.example.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        success: true,
        data: mockExamples,
        count: 2,
      });
    });

    it('handles empty result set', async () => {
      mockPrismaClient.example.findMany.mockResolvedValue([]);

      const result = await getExamples(mockPrismaClient);

      expect(result).toEqual({
        success: true,
        data: [],
        count: 0,
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.example.findMany.mockRejectedValue(error);

      await expect(getExamples(mockPrismaClient)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('createExample', () => {
    it('creates example with name and description', async () => {
      const mockExample = {
        id: 1,
        name: 'New Example',
        description: 'New description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      mockPrismaClient.example.create.mockResolvedValue(mockExample);

      const result = await createExample(
        mockPrismaClient,
        'New Example',
        'New description'
      );

      expect(mockPrismaClient.example.create).toHaveBeenCalledWith({
        data: {
          name: 'New Example',
          description: 'New description',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockExample,
      });
    });

    it('creates example with name only', async () => {
      const mockExample = {
        id: 1,
        name: 'New Example',
        description: null,
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      mockPrismaClient.example.create.mockResolvedValue(mockExample);

      const result = await createExample(mockPrismaClient, 'New Example');

      expect(mockPrismaClient.example.create).toHaveBeenCalledWith({
        data: {
          name: 'New Example',
          description: undefined,
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockExample,
      });
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.example.create.mockRejectedValue(error);

      await expect(
        createExample(mockPrismaClient, 'Test Example')
      ).rejects.toThrow('Database connection failed');
    });
  });
});
