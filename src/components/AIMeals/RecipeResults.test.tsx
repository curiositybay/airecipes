import React from 'react';
import { render, screen } from '@testing-library/react';
import RecipeResults from './RecipeResults';

// Mock the RecipeCard component
jest.mock('./RecipeCard', () => {
  return function MockRecipeCard({
    recipe,
    index,
  }: {
    recipe: { name: string };
    index: number;
  }) {
    return <div data-testid={`recipe-card-${index}`}>{recipe.name}</div>;
  };
});

const mockRecipes = [
  {
    name: 'Test Recipe 1',
    description: 'A delicious test recipe',
    ingredients: ['ingredient 1', 'ingredient 2'],
    instructions: ['step 1', 'step 2'],
    prepTime: '10 minutes',
    difficulty: 'Easy' as const,
    servings: 4,
    tags: ['vegetarian', 'quick'],
    nutritionalInfo: {
      calories: 300,
      protein: '15g',
      carbs: '45g',
      fat: '10g',
    },
  },
  {
    name: 'Test Recipe 2',
    description: 'Another delicious test recipe',
    ingredients: ['ingredient 3', 'ingredient 4'],
    instructions: ['step 3', 'step 4'],
    prepTime: '15 minutes',
    difficulty: 'Medium' as const,
    servings: 6,
    tags: ['spicy', 'dinner'],
    nutritionalInfo: {
      calories: 400,
      protein: '20g',
      carbs: '50g',
      fat: '15g',
    },
  },
];

describe('RecipeResults', () => {
  it('should render recipe cards for each recipe', () => {
    render(<RecipeResults recipes={mockRecipes} />);

    expect(screen.getByTestId('recipe-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
  });

  it('should render empty state when no recipes', () => {
    render(<RecipeResults recipes={[]} />);

    const recipeGrid = document.querySelector('.recipe-grid');
    expect(recipeGrid).toBeInTheDocument();
    expect(recipeGrid?.children.length).toBe(0);
  });

  it('should have proper CSS classes', () => {
    render(<RecipeResults recipes={mockRecipes} />);

    expect(document.querySelector('.recipe-results')).toBeInTheDocument();
    expect(document.querySelector('.recipe-grid')).toBeInTheDocument();
  });
});
