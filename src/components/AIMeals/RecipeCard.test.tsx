import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeCard from './RecipeCard';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockRecipe = {
  name: 'Test Recipe',
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
};

describe('RecipeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render recipe information', () => {
    render(<RecipeCard recipe={mockRecipe} index={0} />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
    expect(screen.getByText('ingredient 1')).toBeInTheDocument();
    expect(screen.getByText('ingredient 2')).toBeInTheDocument();
    expect(screen.getByText('step 1')).toBeInTheDocument();
    expect(screen.getByText('step 2')).toBeInTheDocument();
    expect(screen.getByText('vegetarian')).toBeInTheDocument();
    expect(screen.getByText('quick')).toBeInTheDocument();
  });

  it('should display recipe metadata', () => {
    render(<RecipeCard recipe={mockRecipe} index={0} />);

    expect(screen.getByText('10 minutes')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('4 servings')).toBeInTheDocument();
  });

  it('should display nutritional information', () => {
    render(<RecipeCard recipe={mockRecipe} index={0} />);

    expect(screen.getByText('300 cal')).toBeInTheDocument();
    expect(screen.getByText('15g')).toBeInTheDocument();
    expect(screen.getByText('45g')).toBeInTheDocument();
    expect(screen.getByText('10g')).toBeInTheDocument();
  });

  it('should handle copy to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    render(<RecipeCard recipe={mockRecipe} index={0} />);

    const copyButton = screen.getByTitle('Copy recipe');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Test Recipe')
      );
    });
  });

  it('should handle copy error gracefully', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'));
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<RecipeCard recipe={mockRecipe} index={0} />);

    const copyButton = screen.getByTitle('Copy recipe');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy recipe:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
