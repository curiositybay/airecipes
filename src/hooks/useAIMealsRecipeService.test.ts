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
import Swal from 'sweetalert2';

describe('useAIMealsRecipeService', () => {
  const mockLoginAsDemoUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loginAsDemoUser: mockLoginAsDemoUser,
    });
    (global.fetch as jest.Mock).mockClear();
    setupLocalStorageMock();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAIMealsRecipeService());

    expect(result.current.recipes).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.isFallbackRecipes).toBe(false);
    expect(result.current.fallbackMessage).toBe('');
  });

  it('should show error when trying to generate recipes with no ingredients', async () => {
    const { result } = renderHook(() => useAIMealsRecipeService());

    await act(async () => {
      await result.current.generateRecipes([]);
    });

    expect(result.current.error).toBe('Please add at least one ingredient');
  });

  it('should prompt for demo login when user is not authenticated', async () => {
    (Swal.fire as jest.Mock).mockResolvedValue({ isConfirmed: true });

    const { result } = renderHook(() => useAIMealsRecipeService());

    await act(async () => {
      await result.current.generateRecipes(['tomato']);
    });

    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'Demo Login Required',
      text: 'To test the recipe generation functionality, you will be automatically logged in as a demo user.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Continue as Demo User',
      cancelButtonText: 'Cancel',
    });
  });

  it('should call loginAsDemoUser when user confirms demo login', async () => {
    (Swal.fire as jest.Mock).mockResolvedValue({ isConfirmed: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ recipes: [] }),
    });

    const { result } = renderHook(() => useAIMealsRecipeService());

    await act(async () => {
      await result.current.generateRecipes(['tomato']);
    });

    expect(mockLoginAsDemoUser).toHaveBeenCalled();
  });

  it('should not proceed with recipe generation when user cancels demo login', async () => {
    (Swal.fire as jest.Mock).mockResolvedValue({ isConfirmed: false });

    const { result } = renderHook(() => useAIMealsRecipeService());

    await act(async () => {
      await result.current.generateRecipes(['tomato']);
    });

    expect(Swal.fire).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should generate recipes successfully when user is authenticated', async () => {
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

    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ recipes: mockRecipes }),
    });

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
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          recipes: [{ name: 'Fallback Recipe' }],
          isFallbackRecipes: true,
          message: 'AI service is temporarily unavailable',
        }),
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

  it('should handle recipe generation errors', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

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
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

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

    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          recipes: [{ name: 'Test Recipe' }],
          suggestions: mockSuggestions,
        }),
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
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      loginAsDemoUser: mockLoginAsDemoUser,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          isFallbackRecipes: true,
        }),
    });

    const { result } = renderHook(() => useAIMealsRecipeService());

    await act(async () => {
      await result.current.generateRecipes(['tomato']);
    });

    expect(result.current.recipes).toEqual([]);
  });

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
