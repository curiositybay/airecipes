import { z } from 'zod';
import {
  validateData,
  safeParseData,
  formatZodErrors,
  validateForm,
  createFormValidator,
  validateApiResponse,
  safeValidateApiResponse,
} from './utils';

describe('validation utils', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be 18 or older'),
  });

  describe('validateData', () => {
    it('should validate valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      const result = validateData(testSchema, data);
      expect(result).toEqual(data);
    });

    it('should throw error for invalid data', () => {
      const data = { name: '', email: 'invalid', age: 16 };
      expect(() => validateData(testSchema, data)).toThrow();
    });
  });

  describe('safeParseData', () => {
    it('should return success for valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      const result = safeParseData(testSchema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return error for invalid data', () => {
      const data = { name: '', email: 'invalid', age: 16 };
      const result = safeParseData(testSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('formatZodErrors', () => {
    it('should format Zod errors correctly', () => {
      const data = { name: '', email: 'invalid', age: 16 };
      const result = safeParseData(testSchema, data);

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveProperty('name');
        expect(formatted).toHaveProperty('email');
        expect(formatted).toHaveProperty('age');
      }
    });
  });

  describe('validateForm', () => {
    it('should return success for valid form data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      const result = validateForm(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid form data', () => {
      const data = { name: '', email: 'invalid', age: 16 };
      const result = validateForm(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('age');
    });
  });

  describe('createFormValidator', () => {
    it('should create a working form validator', () => {
      const validator = createFormValidator(testSchema);
      const data = { name: 'John', email: 'john@example.com', age: 25 };

      const result = validator(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('validateApiResponse', () => {
    it('should validate valid API response', () => {
      const response = { name: 'John', email: 'john@example.com', age: 25 };
      const result = validateApiResponse(testSchema, response);
      expect(result).toEqual(response);
    });

    it('should throw error for invalid API response', () => {
      const response = { name: '', email: 'invalid', age: 16 };
      expect(() => validateApiResponse(testSchema, response)).toThrow();
    });
  });

  describe('safeValidateApiResponse', () => {
    it('should return success for valid API response', () => {
      const response = { name: 'John', email: 'john@example.com', age: 25 };
      const result = safeValidateApiResponse(testSchema, response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(response);
      }
    });

    it('should return error for invalid API response', () => {
      const response = { name: '', email: 'invalid', age: 16 };
      const result = safeValidateApiResponse(testSchema, response);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
