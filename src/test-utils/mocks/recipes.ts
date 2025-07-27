import { Recipe } from '@/types/ai-meals';

export const mockRecipe: Recipe = {
  name: 'Test Recipe',
  description: 'A delicious test recipe',
  ingredients: ['ingredient 1', 'ingredient 2'],
  instructions: ['step 1', 'step 2'],
  prepTime: '10 minutes',
  difficulty: 'Easy' as const,
  servings: 4,
  tags: ['vegetarian', 'quick'],
  nutritionalInfo: {
    calories: 300,
    protein: '15g',
    carbs: '45g',
    fat: '10g',
  },
};

export const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => {
  return {
    ...mockRecipe,
    ...overrides,
  };
};

export const createMockRecipeWithoutField = (
  field: keyof Recipe,
  value: unknown
): Recipe => {
  return {
    ...mockRecipe,
    [field]: value,
  } as unknown as Recipe;
};

export const mockRecipe2: Recipe = {
  name: 'Test Recipe 2',
  description: 'Another delicious test recipe',
  ingredients: ['ingredient 3', 'ingredient 4'],
  instructions: ['step 3', 'step 4'],
  prepTime: '15 minutes',
  difficulty: 'Medium' as const,
  servings: 6,
  tags: ['spicy', 'dinner'],
  nutritionalInfo: {
    calories: 400,
    protein: '20g',
    carbs: '50g',
    fat: '15g',
  },
};

export const mockRecipes = [mockRecipe, mockRecipe2];
