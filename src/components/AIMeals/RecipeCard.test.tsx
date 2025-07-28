import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeCard from './RecipeCard';
import { Recipe } from '@/types/ai-meals';
import { mocks } from '@/test-utils/mocks/mocks';
import { timerHelpers } from '@/test-utils/common-test-patterns';

const testClipboardWithRecipe = async (
  recipe: Recipe,
  expectedContent: string,
  shouldContain: boolean = true
) => {
  mocks.mock.frontend.mockClipboardSuccess();

  render(<RecipeCard recipe={recipe} index={0} />);

  const copyButton = screen.getByTitle('Copy recipe');
  fireEvent.click(copyButton);

  await waitFor(() => {
    const expectation = shouldContain
      ? expect.stringContaining(expectedContent)
      : expect.not.stringContaining(expectedContent);
    expect(mocks.mock.frontend.clipboard.writeText).toHaveBeenCalledWith(
      expectation
    );
  });
};

describe('RecipeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.setup.frontend.setupClipboard();
  });

  it('should handle copy error gracefully', async () => {
    mocks.mock.frontend.mockClipboardError(new Error('Copy failed'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<RecipeCard recipe={mocks.mock.recipes.mockRecipe} index={0} />);

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

  it('should reset copied state after timeout', async () => {
    timerHelpers.setupFakeTimers();
    mocks.mock.frontend.mockClipboardSuccess();

    render(<RecipeCard recipe={mocks.mock.recipes.mockRecipe} index={0} />);

    const copyButton = screen.getByTitle('Copy recipe');
    fireEvent.click(copyButton);

    await waitFor(() => {
      const icon = copyButton.querySelector('i');
      expect(icon).toHaveClass('fa-check');
    });

    timerHelpers.advanceTimers(2000);

    await waitFor(() => {
      const icon = copyButton.querySelector('i');
      expect(icon).toHaveClass('fa-copy');
    });

    timerHelpers.restoreRealTimers();
  });

  describe('formatRecipeForCopy - missing optional fields', () => {
    test.each([
      {
        field: 'description',
        value: undefined,
        expectedContent: 'A delicious test recipe',
        testName: 'should handle recipe without description',
      },
      {
        field: 'tags',
        value: undefined,
        expectedContent: 'Tags:',
        testName: 'should handle recipe without tags',
      },
      {
        field: 'ingredients',
        value: undefined,
        expectedContent: 'Ingredients:',
        testName: 'should handle recipe without ingredients',
      },
      {
        field: 'instructions',
        value: undefined,
        expectedContent: 'Instructions:',
        testName: 'should handle recipe without instructions',
      },
    ])('$testName', async ({ field, value, expectedContent }) => {
      const recipeWithoutField = {
        ...mocks.mock.recipes.mockRecipe,
        [field]: value,
      } as unknown as Recipe;

      await testClipboardWithRecipe(recipeWithoutField, expectedContent, false);
    });
  });

  describe('formatRecipeForCopy - metadata handling', () => {
    test.each([
      {
        name: 'should handle recipe without metadata',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          prepTime: undefined,
          difficulty: undefined,
          servings: undefined,
        },
        expectedContent: 'Details:',
        shouldContain: false,
      },
      {
        name: 'should handle recipe with partial metadata',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          prepTime: undefined,
          difficulty: undefined,
        },
        expectedContent: 'Details:',
        shouldContain: true,
      },
      {
        name: 'should handle recipe with missing servings in metadata',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          servings: undefined,
        },
        expectedContent: '• Servings:',
        shouldContain: false,
      },
    ])('$name', async ({ recipe, expectedContent, shouldContain }) => {
      await testClipboardWithRecipe(
        recipe as unknown as Recipe,
        expectedContent,
        shouldContain
      );
    });
  });

  describe('formatRecipeForCopy - nutritional info handling', () => {
    test.each([
      {
        name: 'should handle recipe without nutritional info',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          nutritionalInfo: undefined,
        },
        expectedContent: 'Nutritional Information:',
        shouldContain: false,
      },
      {
        name: 'should handle recipe with partial nutritional info',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          nutritionalInfo: {
            calories: 300,
            protein: undefined,
            carbs: undefined,
            fat: undefined,
          },
        },
        expectedContent: 'Nutritional Information:',
        shouldContain: true,
      },
      {
        name: 'should handle recipe with missing calories in nutritional info',
        recipe: {
          ...mocks.mock.recipes.mockRecipe,
          nutritionalInfo: {
            calories: undefined,
            protein: '15g',
            carbs: '45g',
            fat: '10g',
          },
        },
        expectedContent: '• Calories:',
        shouldContain: false,
      },
    ])('$name', async ({ recipe, expectedContent, shouldContain }) => {
      await testClipboardWithRecipe(
        recipe as unknown as Recipe,
        expectedContent,
        shouldContain
      );
    });
  });
});
