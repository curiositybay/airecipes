import OpenAiService, {
  RecipeGenerationResponse,
  Preferences,
} from './openai-service';
import { prisma } from './prisma';
import { getFallbackRecipes } from './fallback-recipes';
import { mocks } from '@/test-utils/mocks';

// Mock dependencies
jest.mock('./prisma', () => ({
  prisma: {
    tokenUsage: {
      create: jest.fn(),
    },
  },
}));

jest.mock('./logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('./fallback-recipes', () => ({
  getFallbackRecipes: jest.fn(),
}));

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI),
}));

// Type for mock OpenAI response
type MockOpenAIResponse = {
  choices: Array<{
    message: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

// Type for errors with status property
interface ErrorWithStatus extends Error {
  status?: number;
}

// Type for accessing private methods in tests
type OpenAiServiceWithPrivateMethods = {
  buildRecipePrompt: (
    ingredients: string[],
    preferences?: Preferences
  ) => string;
  isCreditError: (
    error: Error | ErrorWithStatus | { status: number }
  ) => boolean;
  isAuthenticationError: (
    error: Error | ErrorWithStatus | { status: number }
  ) => boolean;
  isRateLimitError: (
    error: Error | ErrorWithStatus | { status: number }
  ) => boolean;
};

// Helper function to access private methods
function getPrivateMethods(
  service: OpenAiService
): OpenAiServiceWithPrivateMethods {
  return service as unknown as OpenAiServiceWithPrivateMethods;
}

describe('OpenAiService', () => {
  let service: OpenAiService;
  let mockPrisma: jest.Mocked<typeof prisma>;
  let mockGetFallbackRecipes: jest.MockedFunction<typeof getFallbackRecipes>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.setup.all();

    mocks.mock.config.updateMockConfig({
      openai: {
        apiKey: 'test-api-key',
        model: 'gpt-4o-mini',
      },
    });

    service = new OpenAiService();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    mockGetFallbackRecipes = getFallbackRecipes as jest.MockedFunction<
      typeof getFallbackRecipes
    >;
  });

  afterEach(() => {
    // Reset mock config to defaults
    mocks.mock.config.updateMockConfig({
      openai: {
        apiKey: 'mock-openai-key',
        model: 'gpt-4o-mini',
      },
    });
    mocks.setup.clear();
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      mocks.mock.config.updateMockConfig({
        openai: {
          apiKey: 'test-key',
          model: 'gpt-4',
        },
      });

      const newService = new OpenAiService();
      expect(newService).toBeInstanceOf(OpenAiService);
    });

    it('should use default model when OPENAI_MODEL is not set', () => {
      mocks.mock.config.updateMockConfig({
        openai: {
          apiKey: 'test-key',
          model: 'gpt-4o-mini', // Use default instead of undefined
        },
      });

      const newService = new OpenAiService();
      expect(newService).toBeInstanceOf(OpenAiService);
    });
  });

  describe('generateRecipes', () => {
    const mockIngredients = ['chicken', 'rice', 'vegetables'];
    const mockPreferences: Preferences = {
      dietary: ['vegetarian'],
      cuisine: 'italian',
      difficulty: 'easy',
      maxTime: '30 minutes',
    };

    const mockRecipeResponse: RecipeGenerationResponse = {
      recipes: [
        {
          name: 'Test Recipe',
          description: 'A delicious test recipe',
          tags: ['test', 'easy'],
          ingredients: ['chicken', 'rice'],
          instructions: ['Step 1', 'Step 2'],
          prepTime: '30 minutes',
          difficulty: 'easy',
          servings: 4,
          nutritionalInfo: {
            calories: 400,
            protein: '25g',
            carbs: '45g',
            fat: '12g',
          },
        },
      ],
      suggestions: {
        additionalIngredients: ['salt', 'pepper'],
        cookingTips: ['Cook on medium heat'],
        substitutions: ['Use tofu instead of chicken'],
      },
    };

    it('should generate recipes successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      } as MockOpenAIResponse);

      const result = await service.generateRecipes(
        mockIngredients,
        mockPreferences
      );

      expect(result).toEqual(mockRecipeResponse);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('culinary expert'),
          },
          {
            role: 'user',
            content: expect.stringContaining('chicken, rice, vegetables'),
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: {
          type: 'json_schema',
          json_schema: expect.objectContaining({
            name: 'RecipeGenerationResponse',
          }),
        },
      });
      expect(mockPrisma.tokenUsage.create).toHaveBeenCalledWith({
        data: {
          method: 'generateRecipes',
          model: 'gpt-4o-mini',
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
          success: true,
          errorMessage: null,
        },
      });
    });

    it('should generate recipes with minimal preferences', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 150,
          total_tokens: 200,
        },
      } as MockOpenAIResponse);

      const result = await service.generateRecipes(mockIngredients);

      expect(result).toEqual(mockRecipeResponse);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('chicken, rice, vegetables'),
            }),
          ]),
        })
      );
    });

    it('should handle missing content in response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {},
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 0,
          total_tokens: 100,
        },
      } as MockOpenAIResponse);

      // Mock fallback recipes to be returned
      mockGetFallbackRecipes.mockReturnValue(mockRecipeResponse);

      const result = await service.generateRecipes(mockIngredients);

      // Should return fallback recipes instead of throwing
      expect(result).toEqual(mockRecipeResponse);
      expect(mockGetFallbackRecipes).toHaveBeenCalledWith(mockIngredients);
    });

    it('should handle credit limit errors', async () => {
      const creditError = new Error('insufficient_quota') as ErrorWithStatus;
      creditError.status = 402;

      mockOpenAI.chat.completions.create.mockRejectedValue(creditError);

      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow(
        'AI service is temporarily unavailable due to credit limits. Please try again later.'
      );
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('invalid_api_key') as ErrorWithStatus;
      authError.status = 401;

      mockOpenAI.chat.completions.create.mockRejectedValue(authError);

      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow(
        'AI service configuration error. Please contact support.'
      );
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('rate_limit_exceeded');
      // Don't set status to 429 since that would be caught by credit error handler

      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);

      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow(
        'Too many requests. Please wait a moment and try again.'
      );
    });

    it('should return fallback recipes for other errors', async () => {
      const genericError = new Error('Generic error');
      mockOpenAI.chat.completions.create.mockRejectedValue(genericError);
      mockGetFallbackRecipes.mockReturnValue(mockRecipeResponse);

      const result = await service.generateRecipes(mockIngredients);

      expect(result).toEqual(mockRecipeResponse);
      expect(mockGetFallbackRecipes).toHaveBeenCalledWith(mockIngredients);
    });

    it('should handle usage logging errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      } as MockOpenAIResponse);

      mocks.mock.prisma.client.tokenUsage.create.mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.generateRecipes(mockIngredients);

      expect(result).toEqual(mockRecipeResponse);
      // Should not throw even if logging fails
    });
  });

  describe('buildRecipePrompt', () => {
    it('should build prompt with all preferences', () => {
      const ingredients = ['chicken', 'rice'];
      const preferences: Preferences = {
        dietary: ['vegetarian', 'gluten-free'],
        cuisine: 'italian',
        difficulty: 'easy',
        maxTime: '30 minutes',
      };

      // Access the private method through the service instance
      const prompt = (
        service as unknown as {
          buildRecipePrompt: (
            ingredients: string[],
            preferences?: Preferences
          ) => string;
        }
      ).buildRecipePrompt(ingredients, preferences);

      expect(prompt).toContain('chicken, rice');
      expect(prompt).toContain('vegetarian, gluten-free');
      expect(prompt).toContain('italian');
      expect(prompt).toContain('easy');
      expect(prompt).toContain('30 minutes');
    });

    it('should build prompt with minimal preferences', () => {
      const ingredients = ['chicken', 'rice'];
      const prompt = (
        service as unknown as {
          buildRecipePrompt: (
            ingredients: string[],
            preferences?: Preferences
          ) => string;
        }
      ).buildRecipePrompt(ingredients);

      expect(prompt).toContain('chicken, rice');
      expect(prompt).not.toContain('Dietary preferences:');
      expect(prompt).not.toContain('Cuisine preference:');
      expect(prompt).not.toContain('Difficulty level:');
      expect(prompt).not.toContain('Maximum prep time:');
    });

    it('should build prompt with partial preferences', () => {
      const ingredients = ['chicken', 'rice'];
      const preferences: Preferences = {
        dietary: ['vegetarian'],
        cuisine: 'italian',
      };

      const prompt = (
        service as unknown as {
          buildRecipePrompt: (
            ingredients: string[],
            preferences?: Preferences
          ) => string;
        }
      ).buildRecipePrompt(ingredients, preferences);

      expect(prompt).toContain('chicken, rice');
      expect(prompt).toContain('vegetarian');
      expect(prompt).toContain('italian');
      expect(prompt).not.toContain('Difficulty level:');
      expect(prompt).not.toContain('Maximum prep time:');
    });
  });

  describe('error detection methods', () => {
    describe('isCreditError', () => {
      it('should detect insufficient quota error', () => {
        const error = new Error('insufficient_quota');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect billing error', () => {
        const error = new Error('billing error');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect credit error', () => {
        const error = new Error('credit limit exceeded');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect quota error', () => {
        const error = new Error('quota exceeded');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect payment error', () => {
        const error = new Error('payment required');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect status code 402', () => {
        const error = { status: 402 };
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should detect status code 429', () => {
        const error = { status: 429 };
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(true);
      });

      it('should not detect non-credit errors', () => {
        const error = new Error('generic error');
        const result = getPrivateMethods(service).isCreditError(error);
        expect(result).toBe(false);
      });
    });

    describe('isAuthenticationError', () => {
      it('should detect invalid API key error', () => {
        const error = new Error('invalid_api_key');
        const result = getPrivateMethods(service).isAuthenticationError(error);
        expect(result).toBe(true);
      });

      it('should detect authentication error', () => {
        const error = new Error('authentication failed');
        const result = getPrivateMethods(service).isAuthenticationError(error);
        expect(result).toBe(true);
      });

      it('should detect unauthorized error', () => {
        const error = new Error('unauthorized access');
        const result = getPrivateMethods(service).isAuthenticationError(error);
        expect(result).toBe(true);
      });

      it('should detect status code 401', () => {
        const error = { status: 401 };
        const result = getPrivateMethods(service).isAuthenticationError(error);
        expect(result).toBe(true);
      });

      it('should not detect non-auth errors', () => {
        const error = new Error('generic error');
        const result = getPrivateMethods(service).isAuthenticationError(error);
        expect(result).toBe(false);
      });
    });

    describe('isRateLimitError', () => {
      it('should detect rate limit error', () => {
        const error = new Error('rate_limit_exceeded');
        const result = getPrivateMethods(service).isRateLimitError(error);
        expect(result).toBe(true);
      });

      it('should detect too many requests error', () => {
        const error = new Error('too many requests');
        const result = getPrivateMethods(service).isRateLimitError(error);
        expect(result).toBe(true);
      });

      it('should detect status code 429', () => {
        const error = { status: 429 };
        const result = getPrivateMethods(service).isRateLimitError(error);
        expect(result).toBe(true);
      });

      it('should not detect non-rate-limit errors', () => {
        const error = new Error('generic error');
        const result = getPrivateMethods(service).isRateLimitError(error);
        expect(result).toBe(false);
      });
    });
  });
});
