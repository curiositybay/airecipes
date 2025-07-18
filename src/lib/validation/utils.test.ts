import {
  validateData,
  safeParseData,
  formatZodErrors,
  validateForm,
  createFormValidator,
  validateApiResponse,
  safeValidateApiResponse,
} from './utils';
import { z } from 'zod';

describe('validation utils', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
  });

  const testData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
  };

  describe('validateData', () => {
    it('validates and returns data for valid input', () => {
      const result = validateData(testSchema, testData);

      expect(result).toEqual(testData);
    });

    it('throws error for invalid data', () => {
      const invalidData = { name: '', email: 'invalid-email', age: 16 };

      expect(() => validateData(testSchema, invalidData)).toThrow();
    });
  });

  describe('safeParseData', () => {
    it('returns success result for valid data', () => {
      const result = safeParseData(testSchema, testData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(testData);
      }
    });

    it('returns error result for invalid data', () => {
      const invalidData = { name: '', email: 'invalid-email', age: 16 };
      const result = safeParseData(testSchema, invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });
  });

  describe('formatZodErrors', () => {
    it('formats Zod errors into field-message mapping', () => {
      const invalidData = { name: '', email: 'invalid-email', age: 16 };
      const parseResult = testSchema.safeParse(invalidData);

      if (!parseResult.success) {
        const formattedErrors = formatZodErrors(parseResult.error);

        expect(formattedErrors).toEqual({
          name: 'Name is required',
          email: 'Invalid email',
          age: 'Must be 18 or older',
        });
      }
    });

    it('handles nested field paths', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string().min(1, 'Name is required'),
        }),
      });

      const invalidData = { user: { name: '' } };
      const parseResult = nestedSchema.safeParse(invalidData);

      if (!parseResult.success) {
        const formattedErrors = formatZodErrors(parseResult.error);

        expect(formattedErrors).toEqual({
          'user.name': 'Name is required',
        });
      }
    });

    it('handles array field paths', () => {
      const arraySchema = z.object({
        items: z.array(
          z.object({
            name: z.string().min(1, 'Name is required'),
          })
        ),
      });

      const invalidData = { items: [{ name: '' }] };
      const parseResult = arraySchema.safeParse(invalidData);

      if (!parseResult.success) {
        const formattedErrors = formatZodErrors(parseResult.error);

        expect(formattedErrors).toEqual({
          'items.0.name': 'Name is required',
        });
      }
    });
  });

  describe('validateForm', () => {
    it('returns success for valid form data', () => {
      const result = validateForm(testSchema, testData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.errors).toBeUndefined();
    });

    it('returns error for invalid form data', () => {
      const invalidData = { name: '', email: 'invalid-email', age: 16 };
      const result = validateForm(testSchema, invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toEqual({
        name: 'Name is required',
        email: 'Invalid email',
        age: 'Must be 18 or older',
      });
    });

    it('handles partial data', () => {
      const partialData = { name: 'John Doe' };
      const result = validateForm(testSchema, partialData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('createFormValidator', () => {
    it('creates a validator function for a schema', () => {
      const validator = createFormValidator(testSchema);

      expect(typeof validator).toBe('function');
    });

    it('validates data using the created validator', () => {
      const validator = createFormValidator(testSchema);
      const result = validator(testData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
    });

    it('returns errors for invalid data using the created validator', () => {
      const validator = createFormValidator(testSchema);
      const invalidData = { name: '', email: 'invalid-email', age: 16 };
      const result = validator(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateApiResponse', () => {
    it('validates and returns API response data', () => {
      const responseSchema = z.object({
        data: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        total: z.number(),
      });

      const responseData = {
        data: [{ id: 1, name: 'Item 1' }],
        total: 1,
      };

      const result = validateApiResponse(responseSchema, responseData);

      expect(result).toEqual(responseData);
    });

    it('throws error for invalid API response', () => {
      const responseSchema = z.object({
        data: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        total: z.number(),
      });

      const invalidResponse = {
        data: [{ id: 'invalid', name: 'Item 1' }],
        total: 'not-a-number',
      };

      expect(() =>
        validateApiResponse(responseSchema, invalidResponse)
      ).toThrow();
    });
  });

  describe('safeValidateApiResponse', () => {
    it('returns success result for valid API response', () => {
      const responseSchema = z.object({
        data: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        total: z.number(),
      });

      const responseData = {
        data: [{ id: 1, name: 'Item 1' }],
        total: 1,
      };

      const result = safeValidateApiResponse(responseSchema, responseData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(responseData);
      }
    });

    it('returns error result for invalid API response', () => {
      const responseSchema = z.object({
        data: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        total: z.number(),
      });

      const invalidResponse = {
        data: [{ id: 'invalid', name: 'Item 1' }],
        total: 'not-a-number',
      };

      const result = safeValidateApiResponse(responseSchema, invalidResponse);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('handles empty object schema', () => {
      const emptySchema = z.object({});
      const result = validateForm(emptySchema, {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it('handles schema with optional fields', () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const data = { required: 'test' };
      const result = validateForm(optionalSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('handles schema with default values', () => {
      const defaultSchema = z.object({
        name: z.string().default('default name'),
        count: z.number().default(0),
      });

      const data = {};
      const result = validateForm(defaultSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'default name', count: 0 });
    });
  });
});
