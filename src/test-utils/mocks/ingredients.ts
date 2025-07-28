/**
 * Ingredient-specific mock utilities for testing.
 */

export const mockIngredientResponse = (name: string) => {
  return [{ name, category: 'vegetables' }];
};

export const mockSuggestions = {
  single: [{ name: 'garlic', category: 'vegetables' }],
  basic: [
    { name: 'garlic', category: 'vegetables' },
    { name: 'ginger', category: 'spices' },
    { name: 'onion', category: 'vegetables' },
  ],
  carrot: [
    { name: 'garlic', category: 'vegetables' },
    { name: 'ginger', category: 'spices' },
    { name: 'carrot', category: 'vegetables' },
  ],
  chicken: [
    { name: 'chicken', category: 'meat' },
    { name: 'chicken breast', category: 'meat' },
    { name: 'chicken eggs', category: 'dairy' },
  ],
  tomato: [{ name: 'tomato', category: 'vegetables' }],
};

// Ingredient-specific fetch utilities
export const mockFetchSuggestions = (
  ingredients: Array<{ name: string; category: string }>
) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ ingredients }),
  });
};

export const mockFetchError = (error: number) => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: error });
};

export const mockFetchSequence = (
  ...responses: Array<
    | {
        ok: boolean;
        json?: () => Promise<{
          ingredients: Array<{ name: string; category: string }>;
        }>;
        status?: number;
      }
    | Error
  >
) => {
  responses.forEach(response => {
    if (response instanceof Error) {
      (global.fetch as jest.Mock).mockRejectedValueOnce(response);
    } else {
      (global.fetch as jest.Mock).mockResolvedValueOnce(response);
    }
  });
};
