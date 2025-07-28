import type { RecipeGenerationResponse, Preferences } from './openai-service';
import { mocks } from '@/test-utils/mocks';

// Use Jest's automatic mock for openai (external library)
jest.mock('openai', () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  };

  const OpenAI = jest.fn(() => mockOpenAI);

  return {
    __esModule: true,
    default: OpenAI,
  };
});

// Mock fallback-recipes module
jest.mock('./fallback-recipes', () => ({
  getFallbackRecipes: jest.fn(),
}));

// Type for the OpenAiService class.
type OpenAiServiceType = {
  new (): {
    generateRecipes: (
      ingredients: string[],
      preferences?: Preferences
    ) => Promise<RecipeGenerationResponse>;
  };
};

// Type for mock OpenAI response.
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

// Type for errors with status property.
interface ErrorWithStatus extends Error {
  status?: number;
}

// Type for accessing private methods in tests.
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

// Helper function to access private methods.
function getPrivateMethods(
  service: InstanceType<OpenAiServiceType>
): OpenAiServiceWithPrivateMethods {
  return service as unknown as OpenAiServiceWithPrivateMethods;
}

describe('OpenAiService', () => {
  let service: InstanceType<OpenAiServiceType>;
  let OpenAiService: OpenAiServiceType;
  let mockOpenAI: {
    chat: {
      completions: {
        create: jest.MockedFunction<() => Promise<MockOpenAIResponse>>;
      };
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Use selective setup instead of all()
    mocks.setup.all();

    mocks.mock.config.updateMockConfig({
      openai: {
        apiKey: 'test-api-key',
        model: 'gpt-4o-mini',
      },
    });

    // Import the service after mocks are set up.
    const serviceModule = await import('./openai-service');
    OpenAiService = serviceModule.default;

    service = new OpenAiService();

    // Get the OpenAI mock from Jest's automatic mock
    const OpenAI = jest.requireMock('openai').default;
    mockOpenAI = new OpenAI();
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
    it('should handle missing API key and model', () => {
      mocks.mock.config.updateMockConfig({
        openai: {
          apiKey: '',
          model: '',
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
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.any(String),
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('chicken, rice, vegetables'),
            }),
          ]),
        })
      );
      expect(mocks.mock.prisma.client.tokenUsage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          method: 'generateRecipes',
          success: true,
          errorMessage: null,
        }),
      });
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

      // Mock fallback recipes to be returned.
      const { getFallbackRecipes } = jest.requireMock('./fallback-recipes');
      getFallbackRecipes.mockReturnValue(mockRecipeResponse);

      const result = await service.generateRecipes(mockIngredients);

      // Should return fallback recipes instead of throwing.
      expect(result).toEqual(mockRecipeResponse);
      expect(getFallbackRecipes).toHaveBeenCalledWith(mockIngredients);
    });

    it('should handle different error types appropriately', async () => {
      // Test credit limit error
      const creditError = new Error('insufficient_quota') as ErrorWithStatus;
      creditError.status = 402;
      mockOpenAI.chat.completions.create.mockRejectedValue(creditError);
      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow();

      // Test authentication error
      const authError = new Error('invalid_api_key') as ErrorWithStatus;
      authError.status = 401;
      mockOpenAI.chat.completions.create.mockRejectedValue(authError);
      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow();

      // Test rate limit error
      const rateLimitError = new Error('rate_limit_exceeded');
      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);
      await expect(service.generateRecipes(mockIngredients)).rejects.toThrow();
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

      // Mock the prisma tokenUsage.create to throw an error.
      mocks.mock.prisma.client.tokenUsage.create.mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.generateRecipes(mockIngredients);

      expect(result).toEqual(mockRecipeResponse);
      // Should not throw even if logging fails.
      expect(mocks.mock.prisma.client.tokenUsage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          method: 'generateRecipes',
          success: true,
          errorMessage: null,
        }),
      });
    });
  });

  describe('buildRecipePrompt', () => {
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
    });
  });

  describe('error detection methods', () => {
    it('should detect different error types by status code', () => {
      const creditError = { status: 402 };
      const authError = { status: 401 };
      const rateLimitError = { status: 429 };

      expect(getPrivateMethods(service).isCreditError(creditError)).toBe(true);
      expect(getPrivateMethods(service).isAuthenticationError(authError)).toBe(
        true
      );
      expect(getPrivateMethods(service).isRateLimitError(rateLimitError)).toBe(
        true
      );
    });
  });
});
