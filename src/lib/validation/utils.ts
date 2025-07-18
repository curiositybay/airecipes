import { z } from 'zod';

/**
 * Parse and validate data with Zod schema.
 * @param schema - Zod schema to validate against.
 * @param data - Data to validate.
 * @returns Parsed data or throws error.
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe parse data with Zod schema (doesn't throw).
 * @param schema - Zod schema to validate against.
 * @param data - Data to validate.
 * @returns Success result with parsed data or error.
 */
export function safeParseData<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Format Zod errors for display.
 * @param errors - Zod error object.
 * @returns Formatted error messages.
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  errors.issues.forEach(error => {
    const field = error.path.join('.');
    formattedErrors[field] = error.message;
  });

  return formattedErrors;
}

/**
 * Validate form data and return errors.
 * @param schema - Zod schema to validate against.
 * @param data - Form data to validate.
 * @returns Object with success status and errors.
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }
}

/**
 * Create a form validation hook helper.
 * @param schema - Zod schema for the form.
 * @returns Validation function.
 */
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateForm(schema, data);
}

/**
 * Validate API response with schema.
 * @param schema - Zod schema for the response.
 * @param response - API response data.
 * @returns Parsed response or throws error.
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown
): T {
  return validateData(schema, response);
}

/**
 * Safe validate API response (doesn't throw).
 * @param schema - Zod schema for the response.
 * @param response - API response data.
 * @returns Success result with parsed data or error.
 */
export function safeValidateApiResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown
) {
  return safeParseData(schema, response);
}
