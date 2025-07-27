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
});
