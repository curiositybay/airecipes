import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import OpenAiService from '@/lib/openai-service';
import { validateRequest } from '@/lib/validation';
import { generateRecipesSchema } from '@/lib/validation/ai-meals';

const openAiService = new OpenAiService();

/**
 * Validates ingredients against the database and all business rules.
 */
const validateIngredients = async (
  ingredients: string[]
): Promise<{ isValid: boolean; error?: string }> => {
  const errors: string[] = [];

  // Check if ingredients is an array
  if (!Array.isArray(ingredients)) {
    return { isValid: false, error: 'Ingredients must be an array' };
  }

  // Check for empty array
  if (ingredients.length === 0) {
    return { isValid: false, error: 'At least one ingredient is required' };
  }

  // Check for too many ingredients
  if (ingredients.length > 10) {
    return { isValid: false, error: 'Maximum 10 ingredients allowed' };
  }

  // Check for duplicates
  const uniqueIngredients = new Set(
    ingredients.map(ing => ing.toLowerCase().trim())
  );
  if (uniqueIngredients.size !== ingredients.length) {
    errors.push('Ingredient list contains duplicates');
  }

  // Validate each ingredient
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (typeof ingredient !== 'string') {
      errors.push(`Ingredient at position ${i + 1} must be a string`);
      continue;
    }
    const trimmed = ingredient.trim();
    if (trimmed === '') {
      errors.push(`Ingredient at position ${i + 1} cannot be empty`);
      continue;
    }
    if (trimmed.length > 50) {
      errors.push(`Ingredient at position ${i + 1} is too long`);
      continue;
    }
    // Check existence and activity in the database
    const dbIngredient = await prisma.ingredient.findFirst({
      where: {
        name: trimmed.toLowerCase(),
        isActive: true,
      },
    });
    if (!dbIngredient) {
      errors.push(
        `Ingredient "${trimmed}" is not in our database or is inactive`
      );
    }
  }

  if (errors.length > 0) {
    return { isValid: false, error: errors.join(', ') };
  }
  return { isValid: true };
};

/**
 * Generates recipes using AI based on available ingredients and preferences.
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw request data
    const body = await request.json();

    // Validate request structure
    const validation = validateRequest(generateRecipesSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { ingredients, preferences } = validation.data;

    // Validate ingredients
    const ingredientValidation = await validateIngredients(ingredients);
    if (!ingredientValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: ingredientValidation.error,
        },
        { status: 400 }
      );
    }

    // Sanitize and normalize ingredients
    const sanitizedIngredients = ingredients.map((ing: string) =>
      ing.toLowerCase().trim()
    );

    logger.info('Generating recipes', {
      ingredientCount: sanitizedIngredients.length,
      hasPreferences: !!preferences,
      preferences: preferences || {},
    });

    // Convert preferences to service preferences format
    const servicePreferences: {
      dietary?: string[];
      cuisine?: string;
      difficulty?: string;
      maxTime?: string;
    } = {};
    if (preferences) {
      if (preferences.dietary)
        servicePreferences.dietary = [preferences.dietary];
      if (preferences.cuisine) servicePreferences.cuisine = preferences.cuisine;
      if (preferences.difficulty)
        servicePreferences.difficulty = preferences.difficulty;
      if (preferences.maxTime) servicePreferences.maxTime = preferences.maxTime;
    }

    const result = await openAiService.generateRecipes(
      sanitizedIngredients,
      servicePreferences
    );

    // Filter out any invalid recipe objects (e.g., suggestions objects that got mixed in)
    const validRecipes = result.recipes.filter(
      recipe =>
        recipe &&
        typeof recipe === 'object' &&
        recipe.name &&
        recipe.description &&
        Array.isArray(recipe.ingredients) &&
        Array.isArray(recipe.instructions)
    );

    logger.info('Recipe generation completed', {
      totalRecipes: result.recipes.length,
      validRecipes: validRecipes.length,
      filteredOut: result.recipes.length - validRecipes.length,
    });

    // Check if we got fallback recipes (indicates OpenAI failure)
    const isFallbackRecipes =
      validRecipes.length > 0 &&
      validRecipes[0] &&
      validRecipes[0].description ===
        'This is where the AI-generated description would go had the AI service been available.';

    return NextResponse.json({
      success: true,
      recipes: validRecipes,
      ingredients: sanitizedIngredients,
      isFallbackRecipes: isFallbackRecipes,
      message: isFallbackRecipes
        ? 'AI service is temporarily unavailable. Recipes shown will not make sense but will show a result example.'
        : undefined,
    });
  } catch (error) {
    logger.error('Recipe generation failed', error as Error);

    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to generate recipes';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (
        errorMsg.includes('insufficient_quota') ||
        errorMsg.includes('billing') ||
        errorMsg.includes('credit')
      ) {
        errorMessage =
          'AI service is temporarily unavailable due to credit limits. Please try again later.';
        statusCode = 503; // Service Unavailable
      } else if (
        errorMsg.includes('rate_limit') ||
        errorMsg.includes('too many requests')
      ) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        statusCode = 429; // Too Many Requests
      } else if (
        errorMsg.includes('invalid_api_key') ||
        errorMsg.includes('authentication')
      ) {
        errorMessage =
          'AI service configuration error. Please contact support.';
        statusCode = 500;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
