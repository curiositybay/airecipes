import { renderHook, act } from '@testing-library/react';
import { useAIMealsSurpriseService } from './useAIMealsSurpriseService';
import { setupLocalStorageMock } from '@/test-utils/mocks/mocks';

// Mock fetch
global.fetch = jest.fn();

describe('useAIMealsSurpriseService', () => {
  const mockGenerateRecipes = jest.fn();
  const mockSetIngredients = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    setupLocalStorageMock();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useAIMealsSurpriseService(mockGenerateRecipes, mockSetIngredients)
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle Surprise Me functionality successfully', async () => {
    const mockRandomIngredients = [
      { name: 'chicken' },
      { name: 'rice' },
      { name: 'vegetables' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockRandomIngredients }),
    });

    const { result } = renderHook(() =>
      useAIMealsSurpriseService(mockGenerateRecipes, mockSetIngredients)
    );

    await act(async () => {
      await result.current.handleSurpriseMe();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/ingredients/random');
    expect(mockSetIngredients).toHaveBeenCalledWith([
      'chicken',
      'rice',
      'vegetables',
    ]);
    expect(mockGenerateRecipes).toHaveBeenCalledWith([
      'chicken',
      'rice',
      'vegetables',
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle Surprise Me errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useAIMealsSurpriseService(mockGenerateRecipes, mockSetIngredients)
    );

    await expect(async () => {
      await act(async () => {
        await result.current.handleSurpriseMe();
      });
    }).rejects.toThrow('Failed to get random ingredients. Please try again.');

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle Surprise Me HTTP errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() =>
      useAIMealsSurpriseService(mockGenerateRecipes, mockSetIngredients)
    );

    await expect(async () => {
      await act(async () => {
        await result.current.handleSurpriseMe();
      });
    }).rejects.toThrow('Failed to get random ingredients. Please try again.');

    expect(result.current.isLoading).toBe(false);
  });
});
