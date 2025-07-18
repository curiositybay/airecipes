import type { RecipeGenerationResponse, Recipe } from './openai-service';

export function getFallbackRecipes(
  ingredients: string[]
): RecipeGenerationResponse {
  const fallbackRecipes: Recipe[] = [
    {
      name: 'Simple Stir Fry',
      description:
        'This is where the AI-generated description would go had the AI service been available.',
      tags: ['quick', 'easy', 'stir-fry'],
      ingredients: [...ingredients, 'soy sauce', 'garlic', 'oil'],
      instructions: [
        'Heat oil in a large pan over medium-high heat',
        'Add garlic and stir for 30 seconds',
        'Add your ingredients and stir-fry for 5-7 minutes',
        'Add soy sauce and continue cooking for 2 minutes',
        'Serve hot with rice or noodles',
      ],
      prepTime: '15 minutes',
      difficulty: 'Easy',
      servings: 2,
      nutritionalInfo: {
        calories: 300,
        protein: '15g',
        carbs: '25g',
        fat: '12g',
      },
    },
    {
      name: 'Quick Salad',
      description: 'A refreshing salad using your available ingredients.',
      tags: ['healthy', 'salad', 'quick'],
      ingredients: [
        ...ingredients,
        'olive oil',
        'lemon juice',
        'salt',
        'pepper',
      ],
      instructions: [
        'Wash and prepare your ingredients',
        'Combine all ingredients in a large bowl',
        'Drizzle with olive oil and lemon juice',
        'Season with salt and pepper to taste',
        'Toss gently and serve immediately',
      ],
      prepTime: '10 minutes',
      difficulty: 'Easy',
      servings: 2,
      nutritionalInfo: {
        calories: 150,
        protein: '8g',
        carbs: '15g',
        fat: '8g',
      },
    },
    {
      name: 'Simple Soup',
      description: 'A comforting soup made with your ingredients.',
      tags: ['soup', 'comfort', 'warm'],
      ingredients: [...ingredients, 'vegetable broth', 'onion', 'herbs'],
      instructions: [
        'Sauté onion in a large pot until translucent',
        'Add your ingredients and cook for 2-3 minutes',
        'Pour in vegetable broth and bring to a boil',
        'Reduce heat and simmer for 15-20 minutes',
        'Season with herbs and serve hot',
      ],
      prepTime: '25 minutes',
      difficulty: 'Easy',
      servings: 4,
      nutritionalInfo: {
        calories: 200,
        protein: '10g',
        carbs: '20g',
        fat: '6g',
      },
    },
  ];

  return {
    recipes: fallbackRecipes,
    suggestions: {
      additionalIngredients: ['garlic', 'onion', 'olive oil', 'salt', 'pepper'],
      cookingTips: [
        'Always taste as you cook and adjust seasoning',
        'Prep all ingredients before starting to cook',
        'Keep your cooking area clean and organized',
      ],
      substitutions: [
        'Use any cooking oil if olive oil is not available',
        'Substitute any broth for vegetable broth',
        'Use any fresh herbs you have available',
      ],
    },
  };
}
