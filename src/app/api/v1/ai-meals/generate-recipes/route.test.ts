import { NextRequest } from 'next/server';
import mocks from '@/test-utils/mocks/mocks';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: mocks.mock.prisma.client,
}));

jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
  },
}));

jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(),
}));

const mockGenerateRecipes = jest.fn();
jest.mock('@/lib/openai-service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    generateRecipes: mockGenerateRecipes,
  })),
}));

// Mock auth module
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

describe('/api/v1/ai-meals/generate-recipes', () => {
  let POST: (request: NextRequest) => Promise<Response>;
  let validateRequest: jest.Mock;
  let requireAuth: jest.Mock;

  beforeEach(async () => {
    mocks.setup.all();

    // Import the actual route handler
    const routeModule = await import('./route');
    POST = routeModule.POST;

    // Get mocked dependencies
    const validationModule = await import('@/lib/validation');
    validateRequest = validationModule.validateRequest as jest.Mock;

    const authModule = await import('@/lib/auth');
    requireAuth = authModule.requireAuth as jest.Mock;

    // Set up auth to succeed by default
    requireAuth.mockResolvedValue({
      user: { id: 'test-user', email: 'test@example.com' },
      token: 'mock-token',
    });

    // Import the module to ensure mocks are applied
    await import('@/lib/openai-service');
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  // Helper function to create mock requests
  const createMockRequest = (
    body?: unknown,
    headers?: Record<string, string>
  ): NextRequest => {
    const request: Record<string, unknown> = {};

    if (body !== undefined) {
      request.json = jest.fn().mockResolvedValue(body);
    }

    if (headers) {
      request.headers = {
        get: jest.fn((key: string) => headers[key] || null),
      };
    }

    return request as unknown as NextRequest;
  };

  describe('POST /api/v1/ai-meals/generate-recipes', () => {
    const mockValidRequest = {
      ingredients: ['chicken', 'rice', 'onion'],
      preferences: {
        dietary: 'vegetarian',
        cuisine: 'italian',
        difficulty: 'easy',
        maxTime: '30min',
      },
    };

    const mockValidRecipes = [
      {
        name: 'Chicken Rice Bowl',
        description: 'A delicious and healthy rice bowl',
        tags: ['healthy', 'quick'],
        ingredients: ['chicken', 'rice', 'onion'],
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
    ];

    const mockOpenAiResponse = {
      recipes: mockValidRecipes,
      suggestions: {
        additionalIngredients: ['garlic', 'herbs'],
        cookingTips: ['Use fresh ingredients'],
        substitutions: ['Use tofu instead of chicken'],
      },
    };

    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();

      // Mock successful validation - return the actual request body
      validateRequest.mockImplementation((schema, body) => {
        return {
          success: true,
          data: body,
        };
      });

      // Mock successful ingredient validation
      mocks.mock.prisma.client.ingredient.findFirst.mockImplementation(args => {
        const ingredientName = args?.where?.name;
        if (
          ingredientName === 'chicken' ||
          ingredientName === 'rice' ||
          ingredientName === 'onion'
        ) {
          return Promise.resolve({
            id: 'ingredient-1',
            name: ingredientName,
            isActive: true,
          });
        }
        return Promise.resolve(null);
      });

      // Mock successful OpenAI service
      mockGenerateRecipes.mockResolvedValue(mockOpenAiResponse);
    });

    it('should successfully generate recipes with valid request', async () => {
      const request = createMockRequest(mockValidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.recipes).toEqual(mockValidRecipes);
      expect(responseData.ingredients).toEqual(['chicken', 'rice', 'onion']);
      expect(responseData.isFallbackRecipes).toBe(false);
    });

    it('should handle authentication failure', async () => {
      // Mock auth to fail
      requireAuth.mockRejectedValue(new Error('Authentication required'));

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Authentication required');
    });

    it('should handle validation failure', async () => {
      validateRequest.mockReturnValue({
        success: false,
        error: 'Invalid request data',
      });

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid request data');
    });

    it('should handle ingredient validation failure - empty array', async () => {
      const request = createMockRequest({
        ingredients: [],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('At least one ingredient is required');
    });

    it('should handle ingredient validation failure - too many ingredients', async () => {
      const request = createMockRequest({
        ingredients: Array(11).fill('ingredient'),
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Maximum 10 ingredients allowed');
    });

    it('should handle ingredient validation failure - empty ingredient', async () => {
      const request = createMockRequest({
        ingredients: ['chicken', '', 'rice'],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('cannot be empty');
    });

    it('should handle ingredient validation failure - ingredient too long', async () => {
      const longIngredient = 'a'.repeat(51);
      const request = createMockRequest({
        ingredients: ['chicken', longIngredient, 'rice'],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('too long');
    });

    it('should handle ingredient validation failure - invalid ingredient type', async () => {
      // Mock validation to fail for invalid ingredient type
      validateRequest.mockReturnValue({
        success: false,
        error: 'Ingredient at position 2 must be a string',
      });

      const request = createMockRequest({
        ingredients: ['chicken', 123, 'rice'],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('must be a string');
    });

    it('should handle ingredient validation failure - duplicate ingredients', async () => {
      // Mock successful Zod validation but fail at custom validation
      validateRequest.mockReturnValue({
        success: true,
        data: {
          ingredients: ['chicken', 'chicken', 'rice'],
          preferences: {},
        },
      });

      const request = createMockRequest({
        ingredients: ['chicken', 'chicken', 'rice'],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('duplicates');
    });

    it('should handle ingredient validation failure - ingredient not in database', async () => {
      // Mock successful Zod validation but fail at database validation
      validateRequest.mockReturnValue({
        success: true,
        data: {
          ingredients: ['invalid-ingredient'],
          preferences: {},
        },
      });

      mocks.mock.prisma.client.ingredient.findFirst.mockResolvedValue(null);

      const request = createMockRequest({
        ingredients: ['invalid-ingredient'],
        preferences: {},
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('not in our database');
    });

    // Note: Testing inactive ingredients is complex due to the database query structure
    // The route queries for isActive: true, so inactive ingredients return null
    // This is already covered by the "not in database" test case

    it('should handle malformed JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
    });

    it('should handle OpenAI service errors - insufficient quota', async () => {
      const mockError = new Error('insufficient_quota');
      mockGenerateRecipes.mockRejectedValue(mockError);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(503);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('credit limits');
    });

    it('should handle OpenAI service errors - rate limit', async () => {
      const mockError = new Error('rate_limit');
      mockGenerateRecipes.mockRejectedValue(mockError);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(429);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Too many requests');
    });

    it('should handle OpenAI service errors - invalid API key', async () => {
      const mockError = new Error('invalid_api_key');
      mockGenerateRecipes.mockRejectedValue(mockError);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('configuration error');
    });

    it('should handle OpenAI service errors - generic error', async () => {
      const mockError = new Error('Generic OpenAI error');
      mockGenerateRecipes.mockRejectedValue(mockError);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Failed to generate recipes');
    });

    it('should filter out invalid recipe objects', async () => {
      const mixedResponse = {
        recipes: [
          mockValidRecipes[0],
          { invalid: 'recipe' },
          null,
          undefined,
          { name: 'Incomplete Recipe' }, // Missing required fields
        ],
        suggestions: {
          additionalIngredients: ['garlic'],
          cookingTips: ['Use fresh ingredients'],
          substitutions: ['Use tofu instead of chicken'],
        },
      };

      mockGenerateRecipes.mockResolvedValue(mixedResponse);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.recipes).toHaveLength(1);
      expect(responseData.recipes[0]).toEqual(mockValidRecipes[0]);
    });

    it('should detect fallback recipes', async () => {
      const fallbackRecipes = [
        {
          name: 'Fallback Recipe',
          description:
            'This is where the AI-generated description would go had the AI service been available.',
          tags: ['fallback'],
          ingredients: ['ingredient1', 'ingredient2'],
          instructions: ['Step 1'],
          prepTime: '30 minutes',
          difficulty: 'easy',
          servings: 2,
          nutritionalInfo: {
            calories: 300,
            protein: '20g',
            carbs: '30g',
            fat: '10g',
          },
        },
      ];

      const fallbackResponse = {
        recipes: fallbackRecipes,
        suggestions: {
          additionalIngredients: [],
          cookingTips: [],
          substitutions: [],
        },
      };

      mockGenerateRecipes.mockResolvedValue(fallbackResponse);

      const request = createMockRequest(mockValidRequest);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.isFallbackRecipes).toBe(true);
      expect(responseData.message).toContain(
        'AI service is temporarily unavailable'
      );
    });

    it('should handle request without preferences', async () => {
      const requestWithoutPreferences = {
        ingredients: ['chicken', 'rice'],
      };

      validateRequest.mockReturnValue({
        success: true,
        data: requestWithoutPreferences,
      });

      const request = createMockRequest(requestWithoutPreferences);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should sanitize and normalize ingredients', async () => {
      const requestWithMessyIngredients = {
        ingredients: ['  Chicken  ', 'RICE', '  Onion  '],
        preferences: {},
      };

      validateRequest.mockReturnValue({
        success: true,
        data: requestWithMessyIngredients,
      });

      const request = createMockRequest(requestWithMessyIngredients);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ingredients).toEqual(['chicken', 'rice', 'onion']);
    });
  });
});
