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

jest.mock('../../../../lib/validation', () => ({
  ...jest.requireActual('../../../../lib/validation'),
  validateRequest: jest.fn(),
}));

import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
const mockPrismaClient = mockDeep<PrismaClient>();

jest.mock('../../../../lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

import { setupApiMocks, clearApiMocks } from '../../../../test-utils/mocks';
import { NextRequest, NextResponse } from 'next/server';
import * as validation from '../../../../lib/validation';

describe('api/examples/route', () => {
  let GET: () => Promise<NextResponse>;
  let POST: (request: NextRequest) => Promise<NextResponse>;

  beforeEach(async () => {
    setupApiMocks();
    // Import logic after mocks
    const route = await import('./route');
    GET = route.GET;
    POST = route.POST;
  });

  afterEach(() => {
    clearApiMocks();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns examples on success', async () => {
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
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      mockPrismaClient.example.findMany.mockResolvedValue(mockExamples);

      const response = await GET();
      const data = await response.json();

      expect(mockPrismaClient.example.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(data).toEqual({
        success: true,
        data: mockExamples,
        count: mockExamples.length,
      });
    });

    it('returns 500 on error', async () => {
      const error = new Error('Database error');
      mockPrismaClient.example.findMany.mockRejectedValue(error);

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 if validation fails', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: '' }),
      } as unknown as NextRequest;

      const mockValidation = {
        success: false as const,
        error: 'Name is required',
        details: [
          { field: 'name', message: 'Name is required', code: 'too_small' },
        ],
      };

      // Ensure the mock is properly set up
      const mockValidateRequest =
        validation.validateRequest as jest.MockedFunction<
          typeof validation.validateRequest
        >;
      mockValidateRequest.mockReturnValue(mockValidation);

      const response = await POST(mockRequest);

      expect(mockValidateRequest).toHaveBeenCalled();
      expect(response.status).toBe(400);
    });

    it('creates example and returns 201 on success', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test Example',
          description: 'Test Description',
        }),
      } as unknown as NextRequest;

      const mockValidation = {
        success: true as const,
        data: { name: 'Test Example', description: 'Test Description' },
      };

      const mockCreatedExample = {
        id: 1,
        name: 'Test Example',
        description: 'Test Description',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };

      // Ensure the mock is properly set up
      const mockValidateRequest =
        validation.validateRequest as jest.MockedFunction<
          typeof validation.validateRequest
        >;
      mockValidateRequest.mockReturnValue(mockValidation);
      mockPrismaClient.example.create.mockResolvedValue(mockCreatedExample);

      const response = await POST(mockRequest);
      expect(response.status).toBe(201);
    });

    it('returns 500 when validation succeeds but database creation fails', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test Example',
          description: 'Test Description',
        }),
      } as unknown as NextRequest;

      const mockValidation = {
        success: true as const,
        data: { name: 'Test Example', description: 'Test Description' },
      };

      // Ensure the mock is properly set up
      const mockValidateRequest =
        validation.validateRequest as jest.MockedFunction<
          typeof validation.validateRequest
        >;
      mockValidateRequest.mockReturnValue(mockValidation);
      mockPrismaClient.example.create.mockRejectedValue(
        new Error('Database error')
      );

      const response = await POST(mockRequest);
      expect(response.status).toBe(500);
    });

    it('returns 500 on error', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Request error')),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to create example',
      });
      expect(response.status).toBe(500);
    });
  });
});
