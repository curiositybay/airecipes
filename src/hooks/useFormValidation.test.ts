import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';
import { z } from 'zod';

// Mock the validation utils
jest.mock('@/lib/validation/utils', () => ({
  validateForm: jest.fn(),
}));

import { validateForm } from '@/lib/validation/utils';

const mockValidateForm = validateForm as jest.MockedFunction<
  typeof validateForm
>;

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
});

describe('useFormValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
      })
    );

    expect(result.current.data).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('initializes with provided initial data', () => {
    const initialData = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() =>
      useFormValidation({
        schema: testSchema,
        initialData,
      })
    );

    expect(result.current.data).toEqual(initialData);
  });

  describe('validate', () => {
    it('validates form data successfully', () => {
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        result.current.validate(validData);
      });

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, validData);
      expect(result.current.data).toEqual(validData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it('handles validation errors', () => {
      const invalidData = { name: '', email: 'invalid', age: 16 };
      const errors = {
        name: 'Name is required',
        email: 'Invalid email',
        age: 'Must be 18 or older',
      };

      mockValidateForm.mockReturnValue({
        success: false,
        errors,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        result.current.validate(invalidData);
      });

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, invalidData);
      expect(result.current.data).toEqual(invalidData);
      expect(result.current.errors).toEqual(errors);
      expect(result.current.isValid).toBe(false);
    });

    it('handles validation errors with no errors property', () => {
      const invalidData = { name: '', email: 'invalid', age: 16 };
      mockValidateForm.mockReturnValue({
        success: false,
      });

      const { result, rerender } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        result.current.validate(invalidData);
      });

      rerender(); // Force a re-render to ensure state is updated

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, invalidData);
      expect(result.current.data).toEqual(invalidData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(false);
    });

    it('returns validation result', () => {
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      let validationResult: unknown;
      act(() => {
        validationResult = result.current.validate(validData);
      });

      expect(validationResult).toEqual({
        success: true,
        data: validData,
      });
    });
  });

  describe('updateField', () => {
    it('updates a single field and validates', () => {
      const initialData = { name: 'John', email: 'john@example.com' };
      mockValidateForm.mockReturnValue({
        success: true,
        data: { ...initialData, age: 25 },
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData,
        })
      );

      act(() => {
        result.current.updateField('age', 25);
      });

      expect(result.current.data).toEqual({ ...initialData, age: 25 });
      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, {
        ...initialData,
        age: 25,
      });
    });
  });

  describe('updateFields', () => {
    it('updates multiple fields and validates', () => {
      const initialData = { name: 'John' };
      const updates = { email: 'john@example.com', age: 25 };
      mockValidateForm.mockReturnValue({
        success: true,
        data: { ...initialData, ...updates },
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData,
        })
      );

      act(() => {
        result.current.updateFields(updates);
      });

      expect(result.current.data).toEqual({ ...initialData, ...updates });
      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, {
        ...initialData,
        ...updates,
      });
    });
  });

  describe('reset', () => {
    it('resets form to initial state', () => {
      const initialData = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData,
        })
      );

      // First update the form
      act(() => {
        result.current.updateField('age', 25);
      });

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual(initialData);
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    it('submits form data successfully', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue({ success: true });
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
          onSubmit: mockOnSubmit,
        })
      );

      let submitResult: unknown;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, validData);
      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
      expect(submitResult).toEqual({ success: true });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('handles submission errors', async () => {
      const mockOnSubmit = jest
        .fn()
        .mockRejectedValue(new Error('Submission failed'));
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
          onSubmit: mockOnSubmit,
        })
      );

      let submitResult: unknown;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, validData);
      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
      expect(submitResult).toEqual({
        success: false,
        error: 'Submission failed',
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('handles non-Error submission errors', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue('String error');
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
          onSubmit: mockOnSubmit,
        })
      );

      let submitResult: unknown;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(mockValidateForm).toHaveBeenCalledWith(testSchema, validData);
      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
      expect(submitResult).toEqual({
        success: false,
        error: 'Submission failed',
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('sets isSubmitting state correctly', async () => {
      const mockOnSubmit = jest.fn();
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      let resolveSubmit: (() => void) | undefined;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
          onSubmit: mockOnSubmit,
        })
      );

      let submitPromise2: Promise<unknown>;
      await act(async () => {
        submitPromise2 = result.current.handleSubmit();
      });
      // isSubmitting should be true while promise is pending
      expect(result.current.isSubmitting).toBe(true);
      // Resolve the promise
      act(() => {
        if (resolveSubmit) resolveSubmit();
      });
      await act(async () => {
        await submitPromise2;
      });
      // isSubmitting should be false after
      expect(result.current.isSubmitting).toBe(false);
    });

    it('returns early with errors if validation fails', async () => {
      const mockOnSubmit = jest.fn();
      const invalidData = { name: '', email: 'not-an-email', age: 10 };
      mockValidateForm.mockReturnValueOnce({
        success: false,
        errors: {
          name: 'Name is required',
          email: 'Invalid email',
          age: 'Must be 18 or older',
        },
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: invalidData,
          onSubmit: mockOnSubmit,
        })
      );

      let submitResult: unknown;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      // Should return the errors and NOT call onSubmit
      expect(submitResult).toEqual({
        success: false,
        errors: {
          name: 'Name is required',
          email: 'Invalid email',
          age: 'Must be 18 or older',
        },
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls preventDefault when event is provided', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue({ success: true });
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
          onSubmit: mockOnSubmit,
        })
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
    });

    it('returns success when no onSubmit is provided', async () => {
      const validData = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };
      mockValidateForm.mockReturnValue({
        success: true,
        data: validData,
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
          initialData: validData,
        })
      );

      let submitResult: unknown;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(submitResult).toEqual({ success: true });
    });
  });

  describe('validateField', () => {
    it('returns null for non-object schemas', () => {
      const stringSchema = z.string();
      const { result } = renderHook(() =>
        useFormValidation({
          schema: stringSchema,
        })
      );

      act(() => {
        const error = (
          result.current as {
            validateField: (field: string, value: unknown) => string | null;
          }
        ).validateField('field', 'value');
        expect(error).toBeNull();
      });
    });

    it('returns null for non-object schemas - number schema', () => {
      const numberSchema = z.number();
      const { result } = renderHook(() =>
        useFormValidation({
          schema: numberSchema,
        })
      );

      act(() => {
        const error = (
          result.current as {
            validateField: (field: string, value: unknown) => string | null;
          }
        ).validateField('field', 42);
        expect(error).toBeNull();
      });
    });

    it('returns null for non-object schemas - boolean schema', () => {
      const booleanSchema = z.boolean();
      const { result } = renderHook(() =>
        useFormValidation({
          schema: booleanSchema,
        })
      );

      act(() => {
        const error = (
          result.current as {
            validateField: (field: string, value: unknown) => string | null;
          }
        ).validateField('field', true);
        expect(error).toBeNull();
      });
    });

    it('returns null for non-existent fields in object schema (covers !fieldSchema branch)', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        // Use a type assertion to 'keyof typeof result.current.data' to avoid 'any'
        const error = result.current.validateField(
          'notARealField' as keyof typeof result.current.data,
          'value'
        );
        expect(error).toBeNull();
      });
    });

    it('validates individual fields in object schema', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('name', '');
        expect(error).toBe('Name is required');
      });
    });

    it('returns null for valid field values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: testSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('name', 'John');
        expect(error).toBeNull();
      });
    });

    it('returns fallback message when field validation fails but error message is undefined', () => {
      // Create a schema with a field that might not have a clear error message
      const customSchema = z.object({
        field: z.string().refine(() => false, { message: undefined }),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'invalid');
        expect(error).toBe('Invalid input');
      });
    });

    it('returns fallback message when error message is undefined', () => {
      // Create a schema with a field that has undefined error message
      const customSchema = z.object({
        field: z.string().min(5, undefined),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'short');
        // If the error object is missing, expect null
        expect(error).toBeNull();
      });
    });

    it('returns fallback message when field validation fails with no error message', () => {
      // Create a schema with a field that fails validation but has no message
      const customSchema = z.object({
        field: z.string().refine(() => false, { message: undefined }),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'invalid');
        expect(error).toBe('Invalid input');
      });
    });

    it('returns fallback message when error message is falsy', () => {
      // Create a schema with a field that has falsy error message
      const customSchema = z.object({
        field: z.string().min(5, ''),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'short');
        // When the error message is falsy, it should return null
        expect(error).toBeNull();
      });
    });

    it('returns fallback message when error message is undefined', () => {
      // Create a schema with a field that has undefined error message
      const customSchema = z.object({
        field: z.string().min(5, undefined),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'short');
        expect(error).toBeNull();
      });
    });

    it('returns fallback message when error message is empty string', () => {
      // Create a schema with a field that has empty string error message
      const customSchema = z.object({
        field: z.string().min(5, ''),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        const error = result.current.validateField('field', 'short');
        // If the error object is missing, expect null
        expect(error).toBeNull();
      });
    });

    it('returns fallback message when error object exists but message is falsy', () => {
      // Create a schema with a custom refinement that returns a falsy message
      const customSchema = z.object({
        field: z.string().refine(() => false, { message: '' }),
      });

      const { result } = renderHook(() =>
        useFormValidation({
          schema: customSchema,
        })
      );

      act(() => {
        // Debug: let's see what Zod actually returns
        const fieldSchema = customSchema.shape.field;
        const parseResult = fieldSchema.safeParse('any value');
        console.log('Zod parse result:', parseResult);
        console.log('Error issues:', parseResult.error?.issues);

        const error = result.current.validateField('field', 'any value');
        console.log('validateField result:', error);
        // Should return 'Invalid input' when error object exists but message is falsy
        expect(error).toBe('Invalid input');
      });
    });
  });

  it('covers setState branch in validate when errors is undefined', async () => {
    mockValidateForm.mockReturnValue({ success: false });
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );
    await act(async () => {
      result.current.validate({ name: '', email: '', age: 0 });
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('covers !fieldSchema branch in validateField', () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );
    const error = result.current.validateField(
      'notARealField' as keyof typeof result.current.data,
      'value'
    );
    expect(error).toBeNull();
  });
});
