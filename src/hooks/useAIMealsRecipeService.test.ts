import { renderHook, act } from '@testing-library/react';
import { useAIMealsRecipeService } from './useAIMealsRecipeService';
import {
  localStorageMock,
  setupLocalStorageMock,
} from '@/test-utils/mocks/mocks';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockUseAuth = jest.requireMock('@/contexts/AuthContext').useAuth;

// Mock the themedSwal utility
jest.mock('@/lib/swal-theme', () => ({
  themedSwal: {
    confirm: jest.fn().mockResolvedValue({ isConfirmed: false }),
    info: jest.fn().mockResolvedValue({ isConfirmed: true }),
    success: jest.fn().mockResolvedValue({ isConfirmed: true }),
    warning: jest.fn().mockResolvedValue({ isConfirmed: true }),
    error: jest.fn().mockResolvedValue({ isConfirmed: true }),
    custom: jest.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

import { themedSwal } from '@/lib/swal-theme';

// Helper function to mock fetch response
function mockFetchResponse(data: Record<string, unknown>, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
}

// Helper function to mock authenticated user
function mockAuthenticatedUser() {
  mockUseAuth.mockReturnValue({
    user: { id: 1, name: 'Test User' },
    loginAsDemoUser: jest.fn(),
  });
}

// Helper function to mock unauthenticated user
function mockUnauthenticatedUser() {
  mockUseAuth.mockReturnValue({
    user: null,
    loginAsDemoUser: jest.fn(),
  });
}

describe('useAIMealsRecipeService', () => {
  const mockLoginAsDemoUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnauthenticatedUser();
    mockUseAuth.mockReturnValue({
      user: null,
      loginAsDemoUser: mockLoginAsDemoUser,
    });
    (global.fetch as jest.Mock).mockClear();
    setupLocalStorageMock();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIMealsRecipeService());

      expect(result.current.recipes).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.isFallbackRecipes).toBe(false);
      expect(result.current.fallbackMessage).toBe('');
    });
  });

  describe('recipe generation validation', () => {
    it('should show error when trying to generate recipes with no ingredients', async () => {
      const { result } = renderHook(() => useAIMealsRecipeService());

      await act(async () => {
        await result.current.generateRecipes([]);
      });

      expect(result.current.error).toBe('Please add at least one ingredient');
    });
  });

  describe('authentication handling', () => {
    describe('when user is not authenticated', () => {
      it('should prompt for demo login', async () => {
        (themedSwal.confirm as jest.Mock).mockResolvedValue({
          isConfirmed: true,
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(themedSwal.confirm).toHaveBeenCalledWith({
          title: 'Demo Login Required',
          text: 'To test the recipe generation functionality, you will be automatically logged in as a demo user.',
          icon: 'info',
          confirmButtonText: 'Continue as Demo User',
          cancelButtonText: 'Cancel',
        });
      });

      it('should call loginAsDemoUser when user confirms demo login', async () => {
        (themedSwal.confirm as jest.Mock).mockResolvedValue({
          isConfirmed: true,
        });
        mockFetchResponse({ recipes: [] });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(mockLoginAsDemoUser).toHaveBeenCalled();
      });

      it('should not proceed with recipe generation when user cancels demo login', async () => {
        (themedSwal.confirm as jest.Mock).mockResolvedValue({
          isConfirmed: false,
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(themedSwal.confirm).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('recipe generation', () => {
    describe('when user is authenticated', () => {
      beforeEach(() => {
        mockAuthenticatedUser();
      });

      it('should generate recipes successfully', async () => {
        const mockRecipes = [
          {
            name: 'Test Recipe',
            description: 'A test recipe',
            ingredients: ['tomato', 'onion'],
            instructions: ['Step 1', 'Step 2'],
            prepTime: '30 minutes',
            difficulty: 'Easy',
            servings: 4,
            tags: ['vegetarian'],
            nutritionalInfo: {
              calories: 200,
              protein: '10g',
              carbs: '20g',
              fat: '5g',
            },
          },
        ];

        mockFetchResponse({ recipes: mockRecipes });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato', 'onion']);
        });

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/ai-meals/generate-recipes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: ['tomato', 'onion'] }),
          }
        );

        expect(result.current.recipes).toEqual(mockRecipes);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('');
      });

      it('should handle fallback recipes correctly', async () => {
        mockFetchResponse({
          recipes: [{ name: 'Fallback Recipe' }],
          isFallbackRecipes: true,
          message: 'AI service is temporarily unavailable',
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(result.current.isFallbackRecipes).toBe(true);
        expect(result.current.fallbackMessage).toBe(
          'AI service is temporarily unavailable'
        );
      });

      it('should use default fallback message when message is not provided', async () => {
        mockFetchResponse({
          recipes: [{ name: 'Fallback Recipe' }],
          isFallbackRecipes: true,
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(result.current.isFallbackRecipes).toBe(true);
        expect(result.current.fallbackMessage).toBe(
          'AI service is temporarily unavailable. Here are some basic recipe suggestions based on your ingredients.'
        );
      });

      it('should handle recipe generation errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(
          new Error('Network error')
        );

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(result.current.error).toBe(
          'Failed to generate recipes. Please try again.'
        );
        expect(result.current.isLoading).toBe(false);
      });

      it('should handle HTTP error responses', async () => {
        mockFetchResponse({}, false);

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(result.current.error).toBe(
          'Failed to generate recipes. Please try again.'
        );
      });

      it('should save suggestions to localStorage when provided', async () => {
        const mockSuggestions = {
          additionalIngredients: ['garlic'],
          cookingTips: ['Use fresh ingredients'],
          substitutions: ['Onion for shallot'],
        };

        mockFetchResponse({
          recipes: [{ name: 'Test Recipe' }],
          suggestions: mockSuggestions,
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'aiMeals_suggestions',
          JSON.stringify(mockSuggestions)
        );
      });

      it('should handle when recipes is omitted from the response', async () => {
        mockFetchResponse({
          isFallbackRecipes: true,
        });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        expect(result.current.recipes).toEqual([]);
      });

      it('should scroll to recipe suggestions after successful generation', async () => {
        const mockRecipeSection = {
          scrollIntoView: jest.fn(),
        };
        document.getElementById = jest.fn().mockReturnValue(mockRecipeSection);

        mockFetchResponse({ recipes: [{ name: 'Test Recipe' }] });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        // Wait for the setTimeout to execute
        await new Promise(resolve => setTimeout(resolve, 150));

        expect(document.getElementById).toHaveBeenCalledWith(
          'recipe-suggestions'
        );
        expect(mockRecipeSection.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start',
        });
      });

      it('should handle when recipe suggestions element does not exist', async () => {
        document.getElementById = jest.fn().mockReturnValue(null);

        mockFetchResponse({ recipes: [{ name: 'Test Recipe' }] });

        const { result } = renderHook(() => useAIMealsRecipeService());

        await act(async () => {
          await result.current.generateRecipes(['tomato']);
        });

        // Wait for the setTimeout to execute
        await new Promise(resolve => setTimeout(resolve, 150));

        expect(document.getElementById).toHaveBeenCalledWith(
          'recipe-suggestions'
        );
        // Should not throw an error when element doesn't exist
      });
    });
  });

  describe('recipe management', () => {
    it('should clear recipes state when clearRecipes is called', () => {
      const { result } = renderHook(() => useAIMealsRecipeService());

      act(() => {
        result.current.clearRecipes();
      });

      expect(result.current.recipes).toEqual([]);
      expect(result.current.error).toBe('');
      expect(result.current.isFallbackRecipes).toBe(false);
      expect(result.current.fallbackMessage).toBe('');
    });
  });
});
