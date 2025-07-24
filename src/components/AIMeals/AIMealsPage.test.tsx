import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AIMealsPage from './AIMealsPage';

// Types for mock components
interface MockIngredientInputProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
}

interface MockRecipeResultsProps {
  recipes: Array<{
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    difficulty: string;
    servings: number;
    tags: string[];
    nutritionalInfo: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
}

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../UI/AuthControls', () => {
  return function MockAuthControls() {
    return <div data-testid='auth-controls'>Auth Controls</div>;
  };
});

jest.mock('./IngredientInput', () => {
  return function MockIngredientInput({
    ingredients,
    setIngredients,
  }: MockIngredientInputProps) {
    return (
      <div data-testid='ingredient-input'>
        <button onClick={() => setIngredients(['tomato', 'onion'])}>
          Add Ingredients
        </button>
        <div>Ingredients: {ingredients.join(', ')}</div>
      </div>
    );
  };
});

jest.mock('./RecipeResults', () => {
  return function MockRecipeResults({ recipes }: MockRecipeResultsProps) {
    return <div data-testid='recipe-results'>{recipes.length} recipes</div>;
  };
});

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = jest.requireMock('@/contexts/AuthContext').useAuth;

describe('AIMealsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loginAsDemoUser: jest.fn(),
    });
  });

  it('should render the component', () => {
    render(<AIMealsPage />);

    expect(
      screen.getByText('AI Recipe Generator by Curiosity Bay')
    ).toBeInTheDocument();
    expect(screen.getByTestId('auth-controls')).toBeInTheDocument();
    expect(screen.getByTestId('ingredient-input')).toBeInTheDocument();
  });

  it('should load saved ingredients from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify(['tomato', 'onion'])
    );

    render(<AIMealsPage />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'aiMeals_recentIngredients'
    );
  });

  it('should handle ingredient addition', () => {
    render(<AIMealsPage />);

    const addButton = screen.getByText('Add Ingredients');
    fireEvent.click(addButton);

    expect(screen.getByText('Ingredients: tomato, onion')).toBeInTheDocument();
  });

  it('should handle clear all functionality', () => {
    render(<AIMealsPage />);

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(screen.getByText(/Ingredients:/)).toBeInTheDocument();
  });
});
