import React from 'react';
import { render, screen } from '@testing-library/react';
import RecipeResults from './RecipeResults';
import { mocks } from '@/test-utils/mocks/mocks';

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

const { mockRecipes } = mocks.mock.recipes;

describe('RecipeResults', () => {
  it('should render recipe cards for each recipe', () => {
    render(<RecipeResults recipes={mockRecipes} />);

    expect(screen.getByTestId('recipe-card-0')).toBeInTheDocument();
  });

  it('should render empty state when no recipes', () => {
    render(<RecipeResults recipes={[]} />);

    const recipeGrid = document.querySelector('.recipe-grid');
    expect(recipeGrid).toBeInTheDocument();
    expect(recipeGrid?.children.length).toBe(0);
  });
});
