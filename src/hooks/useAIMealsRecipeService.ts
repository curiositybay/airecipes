import { useState } from 'react';
import { Recipe } from '@/types/ai-meals';
import { themedSwal } from '@/lib/swal-theme';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Manages recipe generation API calls and related state.
 */
export function useAIMealsRecipeService() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFallbackRecipes, setIsFallbackRecipes] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState('');

  const { user, loginAsDemoUser } = useAuth();

  const generateRecipes = async (ingredientsList: string[]): Promise<void> => {
    if (ingredientsList.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    // Check if user is logged in.
    if (!user) {
      const result = await themedSwal.confirm({
        title: 'Demo Login Required',
        text: 'To test the recipe generation functionality, you will be automatically logged in as a demo user.',
        icon: 'info',
        confirmButtonText: 'Continue as Demo User',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        await loginAsDemoUser();
      } else {
        return; // User cancelled.
      }
    }

    setIsLoading(true);
    setError('');
    setRecipes([]); // Clears any existing recipes.
    setIsFallbackRecipes(false);
    setFallbackMessage('');

    try {
      const response = await fetch('/api/v1/ai-meals/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let recipes = data.recipes;
      if (!recipes) recipes = [];
      setRecipes(recipes);

      // Handle fallback recipes.
      if (data.isFallbackRecipes) {
        setIsFallbackRecipes(true);
        setFallbackMessage(
          data.message ||
            'AI service is temporarily unavailable. Here are some basic recipe suggestions based on your ingredients.'
        );
      }

      // Stores suggestions in localStorage for potential future use.
      if (data.suggestions) {
        localStorage.setItem(
          'aiMeals_suggestions',
          JSON.stringify(data.suggestions)
        );
      }

      // Scrolls to recipe suggestions after a short delay to ensure DOM is updated.
      setTimeout(() => {
        const recipeSection = document.getElementById('recipe-suggestions');
        if (recipeSection) {
          recipeSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearRecipes = (): void => {
    setRecipes([]);
    setError('');
    setIsFallbackRecipes(false);
    setFallbackMessage('');
  };

  return {
    recipes,
    isLoading,
    error,
    isFallbackRecipes,
    fallbackMessage,
    generateRecipes,
    clearRecipes,
  };
}
