import { z } from 'zod';

export const generateRecipesSchema = z.object({
  ingredients: z
    .array(
      z
        .string()
        .min(1, 'Ingredient cannot be empty')
        .max(50, 'Ingredient name too long')
    )
    .min(1, 'At least one ingredient is required')
    .max(10, 'Maximum 10 ingredients allowed'),
  preferences: z
    .object({
      dietary: z.string().optional(),
      cuisine: z.string().optional(),
      difficulty: z.string().optional(),
      maxTime: z.string().optional(),
    })
    .optional(),
});

export const ingredientSearchSchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long'),
  limit: z.coerce.number().min(1).max(50).default(10),
  category: z.string().optional(),
});

export type GenerateRecipesRequest = z.infer<typeof generateRecipesSchema>;
export type IngredientSearchRequest = z.infer<typeof ingredientSearchSchema>;
