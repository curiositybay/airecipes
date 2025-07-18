jest.mock('../../../../../lib/prisma', () => ({
  prisma: mockPrismaClient,
}));
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
const mockPrismaClient = mockDeep<PrismaClient>();

// Mock dependencies before importing the logic
jest.mock('../../../../../lib/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../../../../lib/validation', () => ({
  ...jest.requireActual('../../../../../lib/validation'),
  validateRequest: jest.fn(),
}));

import { updateExample, deleteExample } from '../exampleUtils';
import { setupApiMocks, clearApiMocks } from '../../../../../test-utils/mocks';
import { NextRequest, NextResponse } from 'next/server';
import * as validation from '../../../../../lib/validation';

describe('api/examples/[id]/route', () => {
  let PUT: (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => Promise<NextResponse>;
  let DELETE: (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => Promise<NextResponse>;

  beforeEach(async () => {
    setupApiMocks();
    // Import logic after mocks
    const route = await import('./route');
    PUT = route.PUT;
    DELETE = route.DELETE;
  });

  afterEach(() => {
    clearApiMocks();
    jest.clearAllMocks();
  });

  describe('updateExample', () => {
    it('updates example and returns success', async () => {
      const mockUpdatedExample = {
        id: 1,
        name: 'Updated Example',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      mockPrismaClient.example.update.mockResolvedValue(mockUpdatedExample);

      const result = await updateExample(mockPrismaClient, 1, {
        name: 'Updated Example',
        description: 'Updated Description',
      });

      expect(mockPrismaClient.example.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Example',
          description: 'Updated Description',
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockUpdatedExample,
      });
    });
  });

  describe('deleteExample', () => {
    it('deletes example and returns success', async () => {
      const mockExample = {
        id: 1,
        name: 'Updated Example',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };
      mockPrismaClient.example.delete.mockResolvedValue(mockExample);

      const result = await deleteExample(mockPrismaClient, 1);

      expect(mockPrismaClient.example.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('PUT', () => {
    it('returns 400 if validation fails', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: '' }),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: '1' });

      const mockValidation = {
        success: false as const,
        error: 'Name is required',
        details: [
          { field: 'name', message: 'Name is required', code: 'too_small' },
        ],
      };

      // Ensure the mock is properly set up
      (validation.validateRequest as jest.Mock).mockReturnValue(mockValidation);

      const response = await PUT(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(validation.validateRequest as jest.Mock).toHaveBeenCalled();
      expect(data).toEqual({
        success: false,
        error: 'Name is required',
      });
      expect(response.status).toBe(400);
    });

    it('updates example and returns success', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Example',
          description: 'Updated Description',
        }),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: '1' });

      const mockValidation = {
        success: true as const,
        data: {
          name: 'Updated Example',
          description: 'Updated Description',
        },
      };

      const mockUpdatedExample = {
        id: 1,
        name: 'Updated Example',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      // Ensure the mock is properly set up
      (validation.validateRequest as jest.Mock).mockReturnValue(mockValidation);
      mockPrismaClient.example.update.mockResolvedValue(mockUpdatedExample);

      const response = await PUT(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(validation.validateRequest as jest.Mock).toHaveBeenCalled();
      expect(mockPrismaClient.example.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Example',
          description: 'Updated Description',
        },
      });
      expect(data).toEqual({
        success: true,
        data: mockUpdatedExample,
      });
    });

    it('returns 500 when validation succeeds but database update fails', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Updated Example',
          description: 'Updated Description',
        }),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: '1' });

      const mockValidation = {
        success: true as const,
        data: {
          name: 'Updated Example',
          description: 'Updated Description',
        },
      };

      // Ensure the mock is properly set up
      (validation.validateRequest as jest.Mock).mockReturnValue(mockValidation);
      mockPrismaClient.example.update.mockRejectedValue(
        new Error('Database error')
      );

      const response = await PUT(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(validation.validateRequest as jest.Mock).toHaveBeenCalled();
      expect(mockPrismaClient.example.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Example',
          description: 'Updated Description',
        },
      });
      expect(data).toEqual({
        success: false,
        error: 'Failed to update example',
      });
      expect(response.status).toBe(500);
    });

    it('returns 500 on error', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Request error')),
      } as unknown as NextRequest;

      const mockParams = Promise.resolve({ id: '1' });

      const response = await PUT(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to update example',
      });
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('hard deletes example and returns success', async () => {
      const mockRequest = {} as NextRequest;
      const mockParams = Promise.resolve({ id: '1' });

      const mockExample = {
        id: 1,
        name: 'Updated Example',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };
      mockPrismaClient.example.delete.mockResolvedValue(mockExample);

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(mockPrismaClient.example.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(data).toEqual({ success: true });
    });

    it('returns 500 on error', async () => {
      const mockRequest = {} as NextRequest;
      const mockParams = Promise.resolve({ id: '1' });

      mockPrismaClient.example.delete.mockRejectedValue(
        new Error('Database error')
      );

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to delete example',
      });
      expect(response.status).toBe(500);
    });

    it('handles different ID types', async () => {
      const mockRequest = {} as NextRequest;
      const mockParams = Promise.resolve({ id: '123' });

      const mockExample = {
        id: 123,
        name: 'Updated Example',
        description: 'Updated Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };
      mockPrismaClient.example.delete.mockResolvedValue(mockExample);

      const response = await DELETE(mockRequest, { params: mockParams });
      const data = await response.json();

      expect(mockPrismaClient.example.delete).toHaveBeenCalledWith({
        where: { id: 123 },
      });
      expect(data).toEqual({ success: true });
    });
  });
});
