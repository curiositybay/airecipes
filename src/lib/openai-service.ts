import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { appConfig } from '@/config/app';
import { getFallbackRecipes } from './fallback-recipes';

export interface Recipe {
  name: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
  servings: number;
  nutritionalInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface Suggestions {
  additionalIngredients: string[];
  cookingTips: string[];
  substitutions: string[];
}

export interface RecipeGenerationResponse {
  recipes: Recipe[];
  suggestions: Suggestions;
}

export interface Preferences {
  dietary?: string[];
  cuisine?: string;
  difficulty?: string;
  maxTime?: string;
}

class OpenAiService {
  private apiKey: string;
  private model: string;
  private client: OpenAI;

  constructor() {
    this.apiKey = appConfig.openai.apiKey || '';
    this.model = appConfig.openai.model || 'gpt-4o-mini';
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  private isCreditError(error: unknown): boolean {
    // Check for various OpenAI credit-related error patterns.
    const errorObj = error as {
      message?: string;
      code?: string;
      type?: string;
      status?: number;
    };
    const errorMessage = errorObj?.message?.toLowerCase() || '';
    const errorCode = errorObj?.code?.toLowerCase() || '';
    const errorType = errorObj?.type?.toLowerCase() || '';

    return (
      errorMessage.includes('insufficient_quota') ||
      errorMessage.includes('billing') ||
      errorMessage.includes('credit') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('payment') ||
      errorCode === 'insufficient_quota' ||
      errorType === 'insufficient_quota' ||
      errorObj?.status === 429 ||
      errorObj?.status === 402
    );
  }

  private isAuthenticationError(error: unknown): boolean {
    const errorObj = error as {
      message?: string;
      code?: string;
      status?: number;
    };
    const errorMessage = errorObj?.message?.toLowerCase() || '';
    const errorCode = errorObj?.code?.toLowerCase() || '';

    return (
      errorMessage.includes('invalid_api_key') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('unauthorized') ||
      errorCode === 'invalid_api_key' ||
      errorObj?.status === 401
    );
  }

  private isRateLimitError(error: unknown): boolean {
    const errorObj = error as { message?: string; status?: number };
    const errorMessage = errorObj?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('rate_limit') ||
      errorMessage.includes('too many requests') ||
      errorObj?.status === 429
    );
  }

  async generateRecipes(
    ingredients: string[],
    preferences: Preferences = {}
  ): Promise<RecipeGenerationResponse> {
    try {
      const schema = {
        type: 'object',
        properties: {
          recipes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                },
                ingredients: {
                  type: 'array',
                  items: { type: 'string' },
                },
                instructions: {
                  type: 'array',
                  items: { type: 'string' },
                },
                prepTime: { type: 'string' },
                difficulty: { type: 'string' },
                servings: { type: 'integer' },
                nutritionalInfo: {
                  type: 'object',
                  properties: {
                    calories: { type: 'integer' },
                    protein: { type: 'string' },
                    carbs: { type: 'string' },
                    fat: { type: 'string' },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
              },
              required: [
                'name',
                'description',
                'tags',
                'ingredients',
                'instructions',
                'prepTime',
                'difficulty',
                'servings',
                'nutritionalInfo',
              ],
              additionalProperties: false,
            },
          },
          suggestions: {
            type: 'object',
            properties: {
              additionalIngredients: {
                type: 'array',
                items: { type: 'string' },
              },
              cookingTips: {
                type: 'array',
                items: { type: 'string' },
              },
              substitutions: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['additionalIngredients', 'cookingTips', 'substitutions'],
          },
        },
        required: ['recipes', 'suggestions'],
        additionalProperties: false,
      };

      const prompt = this.buildRecipePrompt(ingredients, preferences);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a culinary expert and recipe generator. You create delicious, practical recipes based on available ingredients. Always provide accurate cooking instructions and realistic preparation times. Consider dietary restrictions and preferences when generating recipes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'RecipeGenerationResponse',
            schema: schema,
          },
        },
      });

      await this.logOpenAiUsage('generateRecipes', response, null);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }
      return JSON.parse(content) as RecipeGenerationResponse;
    } catch (error) {
      await this.logOpenAiUsage('generateRecipes', null, error as Error);

      // Handle specific error types.
      if (this.isCreditError(error)) {
        logger.error('OpenAI credit limit reached', { error });
        throw new Error(
          'AI service is temporarily unavailable due to credit limits. Please try again later.'
        );
      }

      if (this.isAuthenticationError(error)) {
        logger.error('OpenAI authentication failed', { error });
        throw new Error(
          'AI service configuration error. Please contact support.'
        );
      }

      if (this.isRateLimitError(error)) {
        logger.error('OpenAI rate limit exceeded', { error });
        throw new Error(
          'Too many requests. Please wait a moment and try again.'
        );
      }

      // For other errors, return fallback recipes.
      logger.error('OpenAI service error, using fallback recipes', { error });
      return getFallbackRecipes(ingredients);
    }
  }

  private buildRecipePrompt(
    ingredients: string[],
    preferences: Preferences = {}
  ): string {
    let prompt = `Generate 3 delicious recipes using these ingredients: ${ingredients.join(', ')}.\n\n`;

    if (preferences.dietary && preferences.dietary.length > 0) {
      prompt += `Dietary preferences: ${preferences.dietary.join(', ')}\n`;
    }
    if (preferences.cuisine) {
      prompt += `Cuisine preference: ${preferences.cuisine}\n`;
    }
    if (preferences.difficulty) {
      prompt += `Difficulty level: ${preferences.difficulty}\n`;
    }
    if (preferences.maxTime) {
      prompt += `Maximum prep time: ${preferences.maxTime}\n`;
    }

    prompt += `\nRequirements:
- Each recipe should be practical and achievable
- Include realistic preparation times and difficulty levels
- Provide accurate nutritional information
- Include helpful cooking tips and ingredient substitutions
- Ensure recipes are diverse and interesting
- Use the provided ingredients as the main components
- Add common pantry staples if needed for complete recipes`;

    return prompt;
  }

  private async logOpenAiUsage(
    method: string,
    response: unknown,
    error: Error | null
  ): Promise<void> {
    try {
      const responseObj = response as {
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };
      const usageData = {
        method,
        model: this.model,
        promptTokens: responseObj?.usage?.prompt_tokens || 0,
        completionTokens: responseObj?.usage?.completion_tokens || 0,
        totalTokens: responseObj?.usage?.total_tokens || 0,
        success: !error,
        errorMessage: error?.message || null,
      };

      await prisma.tokenUsage.create({
        data: usageData,
      });

      logger.info('OpenAI usage logged', usageData);
    } catch (logError) {
      logger.error('Failed to log OpenAI usage', { error: logError });
    }
  }
}

export default OpenAiService;
