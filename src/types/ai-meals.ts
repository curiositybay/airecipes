// AI Recipe Generator Types

export interface Recipe {
  name: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  nutritionalInfo: NutritionalInfo;
}

export interface NutritionalInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface RecipeSuggestions {
  additionalIngredients: string[];
  cookingTips: string[];
  substitutions: string[];
}

export interface RecipeGenerationResponse {
  recipes: Recipe[];
  suggestions: RecipeSuggestions;
  ingredients: string[];
  preferences?: RecipePreferences;
  generatedAt: string;
  isFallbackRecipes?: boolean;
  message?: string;
}

export interface RecipePreferences {
  dietary?: string;
  cuisine?: string;
  difficulty?: string;
  maxTime?: string;
}

// Ingredient data types
export interface Ingredient {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientSearchResponse {
  ingredients: Ingredient[];
}

// Component prop types
export interface IngredientInputProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  setError: (error: string) => void;
}

export interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

export interface RecipeResultsProps {
  recipes: Recipe[];
}
