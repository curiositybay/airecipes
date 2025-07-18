'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateForm } from '@/lib/validation/utils';

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialData?: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface ValidationState<T> {
  data: Partial<T>;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
}

export function useFormValidation<T>({
  schema,
  initialData = {},
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<ValidationState<T>>({
    data: initialData,
    errors: {},
    isValid: false,
    isSubmitting: false,
  });

  const validate = useCallback(
    (data: Partial<T>) => {
      const result = validateForm(schema, data);

      setState(prev => ({
        ...prev,
        data,
        errors: result.errors || {},
        isValid: result.success,
      }));

      return result;
    },
    [schema]
  );

  const updateField = useCallback(
    (field: keyof T, value: unknown) => {
      const newData = { ...state.data, [field]: value };
      validate(newData);
    },
    [state.data, validate]
  );

  const updateFields = useCallback(
    (updates: Partial<T>) => {
      const newData = { ...state.data, ...updates };
      validate(newData);
    },
    [state.data, validate]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      errors: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialData]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      const result = validate(state.data);

      if (!result.success) {
        return { success: false, errors: result.errors };
      }

      if (onSubmit) {
        setState(prev => ({ ...prev, isSubmitting: true }));

        try {
          await onSubmit(result.data!);
          return { success: true };
        } catch (error) {
          console.error('Form submission error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Submission failed',
          };
        } finally {
          setState(prev => ({ ...prev, isSubmitting: false }));
        }
      }

      return { success: true };
    },
    [state.data, validate, onSubmit]
  );

  const validateField = useCallback(
    (field: keyof T, value: unknown) => {
      if (schema instanceof z.ZodObject) {
        const fieldSchema = schema.shape[field as keyof z.infer<typeof schema>];
        if (!fieldSchema) return null;

        const result = fieldSchema.safeParse(value);
        if (result.success) {
          return null;
        }

        const errorMessage = result.error.issues[0]?.message;
        if (errorMessage) {
          return errorMessage;
        } else {
          return 'Invalid input';
        }
      }
      return null;
    },
    [schema]
  );

  return {
    data: state.data,
    errors: state.errors,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,

    updateField,
    updateFields,
    validate,
    reset,
    handleSubmit,
    validateField,
  };
}
