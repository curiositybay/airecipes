import {
  paginationSchema,
  searchQuerySchema,
  createExampleSchema,
  updateExampleSchema,
  exampleIdSchema,
  usageLogQuerySchema,
  createUsageLogSchema,
  healthCheckSchema,
  validateRequest,
  getValidationErrorMessage,
  type CreateExampleRequest,
  type UpdateExampleRequest,
  type UsageLogQuery,
  type CreateUsageLogRequest,
  type HealthCheckQuery,
} from './validation';
import { z } from 'zod';

describe('validation', () => {
  describe('paginationSchema', () => {
    it('validates valid pagination data', () => {
      const data = { page: 1, limit: 20 };
      const result = paginationSchema.parse(data);

      expect(result).toEqual({ page: 1, limit: 20 });
    });

    it('uses default values when not provided', () => {
      const data = {};
      const result = paginationSchema.parse(data);

      expect(result).toEqual({ page: 1, limit: 20 });
    });

    it('coerces string values to numbers', () => {
      const data = { page: '2', limit: '50' };
      const result = paginationSchema.parse(data);

      expect(result).toEqual({ page: 2, limit: 50 });
    });

    it('validates minimum page value', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
      expect(() => paginationSchema.parse({ page: -1 })).toThrow();
    });

    it('validates limit range', () => {
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe('searchQuerySchema', () => {
    it('validates valid search query', () => {
      const data = { q: 'test query', page: 1, limit: 20 };
      const result = searchQuerySchema.parse(data);

      expect(result).toEqual({ q: 'test query', page: 1, limit: 20 });
    });

    it('validates query string length', () => {
      expect(() => searchQuerySchema.parse({ q: '' })).toThrow();
      expect(() => searchQuerySchema.parse({ q: 'a'.repeat(101) })).toThrow();
    });
  });

  describe('createExampleSchema', () => {
    it('validates valid create example data', () => {
      const data = {
        name: 'Test Example',
        description: 'Test description',
      };
      const result = createExampleSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('validates name requirements', () => {
      expect(() => createExampleSchema.parse({ name: '' })).toThrow();
      expect(() =>
        createExampleSchema.parse({ name: 'a'.repeat(101) })
      ).toThrow();
    });

    it('allows optional description', () => {
      const data = { name: 'Test Example' };
      const result = createExampleSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('validates description length', () => {
      const data = { name: 'Test Example', description: 'a'.repeat(501) };
      expect(() => createExampleSchema.parse(data)).toThrow();
    });
  });

  describe('updateExampleSchema', () => {
    it('validates valid update example data', () => {
      const data = {
        name: 'Updated Example',
        description: 'Updated description',
        isActive: true,
      };
      const result = updateExampleSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('allows partial updates', () => {
      const data = { name: 'Updated Example' };
      const result = updateExampleSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('validates name when provided', () => {
      expect(() => updateExampleSchema.parse({ name: '' })).toThrow();
      expect(() =>
        updateExampleSchema.parse({ name: 'a'.repeat(101) })
      ).toThrow();
    });
  });

  describe('exampleIdSchema', () => {
    it('validates valid example ID', () => {
      const data = { id: 1 };
      const result = exampleIdSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('coerces string ID to number', () => {
      const data = { id: '123' };
      const result = exampleIdSchema.parse(data);

      expect(result).toEqual({ id: 123 });
    });

    it('validates positive ID', () => {
      expect(() => exampleIdSchema.parse({ id: 0 })).toThrow();
      expect(() => exampleIdSchema.parse({ id: -1 })).toThrow();
    });
  });

  describe('usageLogQuerySchema', () => {
    it('validates valid usage log query', () => {
      const data = {
        method: 'GET',
        success: true,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        page: 1,
        limit: 20,
      };
      const result = usageLogQuerySchema.parse(data);

      expect(result).toEqual(data);
    });

    it('allows optional fields', () => {
      const data = { page: 1, limit: 20 };
      const result = usageLogQuerySchema.parse(data);

      expect(result).toEqual(data);
    });

    it('coerces boolean values', () => {
      const data = { success: 'true' };
      const result = usageLogQuerySchema.parse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('createUsageLogSchema', () => {
    it('validates valid usage log data', () => {
      const data = {
        method: 'POST',
        success: true,
        errorMessage: 'Test error',
      };
      const result = createUsageLogSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('validates method requirement', () => {
      expect(() => createUsageLogSchema.parse({ method: '' })).toThrow();
    });

    it('uses default success value', () => {
      const data = { method: 'GET' };
      const result = createUsageLogSchema.parse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('healthCheckSchema', () => {
    it('validates valid health check query', () => {
      const data = { detailed: true };
      const result = healthCheckSchema.parse(data);

      expect(result).toEqual(data);
    });

    it('coerces boolean values', () => {
      const data = { detailed: 'false' };
      const result = healthCheckSchema.parse(data);

      expect(result.detailed).toBe(true); // 'false' string coerces to true in JavaScript
    });
  });

  describe('validateRequest', () => {
    it('returns success for valid data', () => {
      const schema = createExampleSchema;
      const data = {
        name: 'Test Example',
        description: 'Test description',
      };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('returns error for invalid data', () => {
      const schema = createExampleSchema;
      const data = { name: '', description: 'Test description' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Name is required');
        expect(result.details).toHaveLength(1);
      }
    });

    it('handles invalid type errors', () => {
      const schema = createExampleSchema;
      const data = { name: 123, description: 'Test description' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Name must be a string');
      }
    });

    it('handles too small errors', () => {
      const schema = createExampleSchema;
      const data = { name: '', description: 'Test description' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Name is required');
      }
    });

    it('handles too big errors', () => {
      const schema = createExampleSchema;
      const data = {
        name: 'a'.repeat(101),
        description: 'Test description',
      };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Name too long');
      }
    });

    it('handles non-Zod errors', () => {
      const schema = createExampleSchema;
      const data = null;

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Expected object, received null');
        expect(result.details).toHaveLength(1);
        expect(result.details[0]).toEqual({
          field: '',
          message: 'Expected object, received null',
          code: 'invalid_type',
        });
      }
    });

    it('handles Zod errors without specific mapping', () => {
      const schema = z.object({ field: z.string() });
      const data = { field: 123 };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Expected string, received number');
      }
    });

    it('handles non-Zod errors with fallback message', () => {
      const schema = z.object({
        name: z.string(),
      });

      // Mock schema.parse to throw a non-ZodError
      const originalParse = schema.parse;
      schema.parse = jest.fn().mockImplementation(() => {
        throw new Error('Custom error');
      });

      const result = validateRequest(schema, { name: 'test' });

      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        details: [],
      });

      // Restore original parse method
      schema.parse = originalParse;
    });

    it('handles Zod errors with empty error array', () => {
      // Create a schema that produces a ZodError with no errors
      const schema = z.object({
        field: z.string().refine(() => false, { message: undefined }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid input');
      }
    });

    it('handles Zod errors with empty errors array', () => {
      // Mock a ZodError with empty errors array to test the fallback
      const mockZodError = {
        issues: [],
        name: 'ZodError',
        message: 'Validation failed',
      } as unknown as z.ZodError;

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw mockZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
      }
    });

    it('handles Zod errors with falsy message', () => {
      // Mock a ZodError with an issue that has a falsy message
      const mockZodError = {
        issues: [
          {
            code: 'custom',
            path: ['field'],
            message: '', // Empty message
          },
        ],
        name: 'ZodError',
        message: 'Validation failed',
      } as unknown as z.ZodError;

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw mockZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
      }
    });

    it('handles Zod errors with undefined message', () => {
      // Mock a ZodError with an issue that has an undefined message
      const mockZodError = {
        issues: [
          {
            code: 'custom',
            path: ['field'],
            message: undefined, // Undefined message
          },
        ],
        name: 'ZodError',
        message: 'Validation failed',
      } as unknown as z.ZodError;

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw mockZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
      }
    });

    it('handles Zod errors with no issues (firstError undefined)', () => {
      // Mock a ZodError with no issues
      const mockZodError = {
        issues: [],
        name: 'ZodError',
        message: 'Validation failed',
      } as unknown as z.ZodError;

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw mockZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
      }
    });

    it('handles ZodError with empty issues array (firstError undefined)', () => {
      // Mock a ZodError with no issues
      const mockZodError = {
        issues: [],
        name: 'ZodError',
        message: 'Validation failed',
      } as unknown as z.ZodError;

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw mockZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
      }
    });

    it('handles ZodError with empty issues array - direct test for line 67', () => {
      // Create a custom ZodError with empty issues array
      const customZodError = new z.ZodError([]);

      // Mock the schema to throw our custom ZodError
      const schema = z.object({
        field: z.string().refine(() => {
          throw customZodError;
        }),
      });
      const data = { field: 'test' };

      const result = validateRequest(schema, data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Validation failed');
        expect(result.details).toEqual([]);
      }
    });
  });

  describe('TypeScript types', () => {
    it('exports correct types', () => {
      // These are just type checks - they should compile without errors
      const createExample: CreateExampleRequest = {
        name: 'Test',
        description: 'Test',
      };
      const updateExample: UpdateExampleRequest = { name: 'Test' };
      const usageLogQuery: UsageLogQuery = {
        method: 'GET',
        success: true,
        page: 1,
        limit: 20,
      };
      const createUsageLog: CreateUsageLogRequest = {
        method: 'GET',
        success: true,
      };
      const healthCheck: HealthCheckQuery = { detailed: true };

      expect(createExample).toBeDefined();
      expect(updateExample).toBeDefined();
      expect(usageLogQuery).toBeDefined();
      expect(createUsageLog).toBeDefined();
      expect(healthCheck).toBeDefined();
    });
  });
});

describe('getValidationErrorMessage', () => {
  it('returns the message if present', () => {
    expect(getValidationErrorMessage({ message: 'Test error' })).toBe(
      'Test error'
    );
  });
  it('returns fallback if message is empty string', () => {
    expect(getValidationErrorMessage({ message: '' })).toBe(
      'Validation failed'
    );
  });
  it('returns fallback if message is undefined', () => {
    expect(getValidationErrorMessage({})).toBe('Validation failed');
  });
  it('returns fallback if firstError is undefined', () => {
    expect(getValidationErrorMessage(undefined)).toBe('Validation failed');
  });
});
