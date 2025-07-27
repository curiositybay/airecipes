import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AIMealsPage from './AIMealsPage';

jest.mock('@/hooks/useAIMealsStorage', () => ({
  useAIMealsStorage: jest.fn(),
}));

jest.mock('@/hooks/useAIMealsRecipeService', () => ({
  useAIMealsRecipeService: jest.fn(),
}));

jest.mock('@/hooks/useAIMealsSurpriseService', () => ({
  useAIMealsSurpriseService: jest.fn(),
}));

jest.mock('./AIMealsHero', () => {
  return function MockAIMealsHero() {
    return <div data-testid='ai-meals-hero'>AI Meals Hero</div>;
  };
});

jest.mock('./AIMealsLayout', () => {
  return function MockAIMealsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid='ai-meals-layout'>{children}</div>;
  };
});

jest.mock('./AIMealsActions', () => {
  return function MockAIMealsActions({
    onGetRecipes,
    onSurpriseMe,
    onClearAll,
    isLoading,
    hasContent,
  }: {
    onGetRecipes: () => void;
    onSurpriseMe: () => void;
    onClearAll: () => void;
    isLoading: boolean;
    hasContent: boolean;
  }) {
    return (
      <div data-testid='ai-meals-actions'>
        <button onClick={onGetRecipes} disabled={isLoading}>
          {isLoading ? 'Generating Recipes...' : 'Get Recipes'}
        </button>
        <button onClick={onSurpriseMe}>Surprise Me</button>
        <button onClick={onClearAll} disabled={!hasContent}>
          Clear All
        </button>
      </div>
    );
  };
});

jest.mock('./AIMealsMessages', () => {
  return function MockAIMealsMessages({
    error,
    isFallbackRecipes,
    fallbackMessage,
  }: {
    error: string;
    isFallbackRecipes: boolean;
    fallbackMessage: string;
  }) {
    return (
      <div data-testid='ai-meals-messages'>
        {error && <div data-testid='error-message'>{error}</div>}
        {isFallbackRecipes && fallbackMessage && (
          <div data-testid='fallback-message'>{fallbackMessage}</div>
        )}
      </div>
    );
  };
});

jest.mock('./IngredientInput', () => {
  return function MockIngredientInput({
    ingredients,
    setIngredients,
    setError,
  }: {
    ingredients: string[];
    setIngredients: (ingredients: string[]) => void;
    setError: (error: string) => void;
  }) {
    return (
      <div data-testid='ingredient-input'>
        <button onClick={() => setIngredients(['tomato', 'onion'])}>
          Add Ingredients
        </button>
        <button onClick={() => setError('Test error')}>Set Error</button>
        <div>Ingredients: {ingredients.join(', ')}</div>
      </div>
    );
  };
});

jest.mock('./RecipeResults', () => {
  return function MockRecipeResults({
    recipes,
  }: {
    recipes: Array<{ name: string }>;
  }) {
    return <div data-testid='recipe-results'>{recipes.length} recipes</div>;
  };
});

const mockUseAIMealsStorage = jest.requireMock(
  '@/hooks/useAIMealsStorage'
).useAIMealsStorage;
const mockUseAIMealsRecipeService = jest.requireMock(
  '@/hooks/useAIMealsRecipeService'
).useAIMealsRecipeService;
const mockUseAIMealsSurpriseService = jest.requireMock(
  '@/hooks/useAIMealsSurpriseService'
).useAIMealsSurpriseService;

describe('AIMealsPage', () => {
  const mockSetIngredients = jest.fn();
  const mockGenerateRecipes = jest.fn();
  const mockClearRecipes = jest.fn();
  const mockHandleSurpriseMe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAIMealsStorage.mockReturnValue({
      ingredients: [],
      setIngredients: mockSetIngredients,
    });

    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [],
      isLoading: false,
      error: '',
      isFallbackRecipes: false,
      fallbackMessage: '',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    mockUseAIMealsSurpriseService.mockReturnValue({
      handleSurpriseMe: mockHandleSurpriseMe,
    });
  });

  it('should render all components', () => {
    render(<AIMealsPage />);

    expect(screen.getByTestId('ai-meals-hero')).toBeInTheDocument();
    expect(screen.getByTestId('ai-meals-layout')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-input')).toBeInTheDocument();
    expect(screen.getByTestId('ai-meals-actions')).toBeInTheDocument();
    expect(screen.getByTestId('ai-meals-messages')).toBeInTheDocument();
  });

  it('should call generateRecipes when Get Recipes button is clicked', () => {
    mockUseAIMealsStorage.mockReturnValue({
      ingredients: ['tomato', 'onion'],
      setIngredients: mockSetIngredients,
    });

    render(<AIMealsPage />);

    fireEvent.click(screen.getByText('Get Recipes'));
    expect(mockGenerateRecipes).toHaveBeenCalledWith(['tomato', 'onion']);
  });

  it('should call handleSurpriseMe when Surprise Me button is clicked', () => {
    render(<AIMealsPage />);

    fireEvent.click(screen.getByText('Surprise Me'));
    expect(mockHandleSurpriseMe).toHaveBeenCalledTimes(1);
  });

  it('should call clearAll when Clear All button is clicked', () => {
    mockUseAIMealsStorage.mockReturnValue({
      ingredients: ['tomato'],
      setIngredients: mockSetIngredients,
    });

    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [{ name: 'Test Recipe' }],
      isLoading: false,
      error: '',
      isFallbackRecipes: false,
      fallbackMessage: '',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    render(<AIMealsPage />);

    fireEvent.click(screen.getByText('Clear All'));
    expect(mockSetIngredients).toHaveBeenCalledWith([]);
    expect(mockClearRecipes).toHaveBeenCalledTimes(1);
  });

  it('should pass correct props to AIMealsActions', () => {
    mockUseAIMealsStorage.mockReturnValue({
      ingredients: ['tomato'],
      setIngredients: mockSetIngredients,
    });

    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [{ name: 'Test Recipe' }],
      isLoading: true,
      error: 'Test error',
      isFallbackRecipes: false,
      fallbackMessage: '',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    render(<AIMealsPage />);

    const getRecipesButton = screen.getByText('Generating Recipes...');
    expect(getRecipesButton).toBeDisabled();
  });

  it('should pass correct props to AIMealsMessages', () => {
    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [],
      isLoading: false,
      error: 'Test error message',
      isFallbackRecipes: true,
      fallbackMessage: 'AI service is temporarily unavailable',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    render(<AIMealsPage />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Test error message'
    );
    expect(screen.getByTestId('fallback-message')).toHaveTextContent(
      'AI service is temporarily unavailable'
    );
  });

  it('should render RecipeResults when recipes are available', () => {
    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [{ name: 'Test Recipe' }],
      isLoading: false,
      error: '',
      isFallbackRecipes: false,
      fallbackMessage: '',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    render(<AIMealsPage />);

    expect(screen.getByTestId('recipe-results')).toBeInTheDocument();
    expect(screen.getByText('1 recipes')).toBeInTheDocument();
  });

  it('should not render RecipeResults when no recipes are available', () => {
    mockUseAIMealsRecipeService.mockReturnValue({
      recipes: [],
      isLoading: false,
      error: '',
      isFallbackRecipes: false,
      fallbackMessage: '',
      generateRecipes: mockGenerateRecipes,
      clearRecipes: mockClearRecipes,
    });

    render(<AIMealsPage />);

    expect(screen.queryByTestId('recipe-results')).not.toBeInTheDocument();
  });

  it('should pass empty function to IngredientInput setError', () => {
    render(<AIMealsPage />);

    fireEvent.click(screen.getByText('Set Error'));

    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
