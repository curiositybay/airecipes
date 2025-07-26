import { useState } from 'react';

/**
 * Manages the Surprise Me functionality for random ingredient generation.
 */
export function useAIMealsSurpriseService(
  generateRecipes: (ingredients: string[]) => Promise<void>,
  setIngredients: (ingredients: string[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSurpriseMe = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/v1/ingredients/random');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const randomIngredients = data.ingredients.map(
        (ingredient: { name: string }) => ingredient.name
      );

      setIngredients(randomIngredients);

      // Auto-trigger recipe generation with the random ingredients.
      await generateRecipes(randomIngredients);
    } catch (err) {
      console.error('Random ingredients error:', err);
      throw new Error('Failed to get random ingredients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSurpriseMe, isLoading };
}
