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
} from './validation';
import { z } from 'zod';

describe('validation', () => {
  describe('paginationSchema', () => {
    it('validates valid pagination data', () => {
      const data = { page: 1, limit: 20 };
      const result = paginationSchema.parse(data);

      expect(result).toEqual({ page: 1, limit: 20 });
    });
  });

  describe('searchQuerySchema', () => {
    it('validates valid search query', () => {
      const data = { q: 'test query', page: 1, limit: 20 };
      const result = searchQuerySchema.parse(data);

      expect(result).toEqual({ q: 'test query', page: 1, limit: 20 });
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
  });

  describe('exampleIdSchema', () => {
    it('validates valid example ID', () => {
      const data = { id: 1 };
      const result = exampleIdSchema.parse(data);

      expect(result).toEqual(data);
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
  });

  describe('healthCheckSchema', () => {
    it('validates valid health check query', () => {
      const data = { detailed: true };
      const result = healthCheckSchema.parse(data);

      expect(result).toEqual(data);
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
});

describe('getValidationErrorMessage', () => {
  it('returns fallback if message is empty string', () => {
    expect(getValidationErrorMessage({ message: '' })).toBe(
      'Validation failed'
    );
  });
});
