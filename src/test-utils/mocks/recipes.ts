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

export const mockRecipes = [mockRecipe];
