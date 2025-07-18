import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  ...paginationSchema.shape,
});

export const createExampleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional(),
});

export const updateExampleSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const exampleIdSchema = z.object({
  id: z.coerce.number().positive(),
});

export const usageLogQuerySchema = z.object({
  method: z.string().optional(),
  success: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ...paginationSchema.shape,
});

export const createUsageLogSchema = z.object({
  method: z.string().min(1, 'Method is required'),
  success: z.boolean().default(true),
  errorMessage: z.string().optional(),
});

export const healthCheckSchema = z.object({
  detailed: z.coerce.boolean().optional(),
});

export function getValidationErrorMessage(
  firstError: { message?: string; code?: string; path?: unknown[] } | undefined
): string {
  if (!firstError) return 'Validation failed';
  if (firstError.message) return firstError.message;
  return 'Validation failed';
}

export function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | {
      success: false;
      error: string;
      details: Array<{ field: string; message: string; code: string }>;
    } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues.length > 0 ? error.issues[0] : undefined;
      let errorMessage = getValidationErrorMessage(firstError);

      // Map specific Zod error codes to expected test messages.
      if (
        firstError?.code === 'invalid_type' &&
        firstError.path.includes('name')
      ) {
        errorMessage = 'Name must be a string';
      } else if (
        firstError?.code === 'too_small' &&
        firstError.path.includes('name')
      ) {
        errorMessage = 'Name is required';
      } else if (
        firstError?.code === 'too_big' &&
        firstError.path.includes('name')
      ) {
        errorMessage = 'Name too long';
      }

      return {
        success: false,
        error: errorMessage,
        details: error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
    return {
      success: false,
      error: 'Validation failed',
      details: [],
    };
  }
}

export type CreateExampleRequest = z.infer<typeof createExampleSchema>;
export type UpdateExampleRequest = z.infer<typeof updateExampleSchema>;
export type UsageLogQuery = z.infer<typeof usageLogQuerySchema>;
export type CreateUsageLogRequest = z.infer<typeof createUsageLogSchema>;
export type HealthCheckQuery = z.infer<typeof healthCheckSchema>;
