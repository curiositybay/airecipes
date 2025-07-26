import { renderHook, act } from '@testing-library/react';
import { useAIMealsStorage } from './useAIMealsStorage';
import {
  localStorageMock,
  setupLocalStorageMock,
} from '@/test-utils/mocks/mocks';

describe('useAIMealsStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLocalStorageMock();
  });

  it('should initialize with empty ingredients', () => {
    const { result } = renderHook(() => useAIMealsStorage());
    expect(result.current.ingredients).toEqual([]);
  });

  it('should load ingredients from localStorage on mount', () => {
    const savedIngredients = ['tomato', 'onion'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedIngredients));

    const { result } = renderHook(() => useAIMealsStorage());
    expect(result.current.ingredients).toEqual(savedIngredients);
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'aiMeals_recentIngredients'
    );
  });

  it('should handle localStorage parsing errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useAIMealsStorage());

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load saved ingredients:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should save ingredients to localStorage when they change', () => {
    const { result } = renderHook(() => useAIMealsStorage());

    act(() => {
      result.current.setIngredients(['tomato', 'onion']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'aiMeals_recentIngredients',
      JSON.stringify(['tomato', 'onion'])
    );
  });

  it('should not save to localStorage when ingredients are empty', () => {
    const { result } = renderHook(() => useAIMealsStorage());

    act(() => {
      result.current.setIngredients([]);
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});
