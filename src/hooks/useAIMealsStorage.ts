import { useState, useEffect } from 'react';

/**
 * Manages localStorage operations for AI Meals ingredients.
 */
export function useAIMealsStorage() {
  const [ingredients, setIngredients] = useState<string[]>([]);

  // Loads recent ingredients from localStorage.
  useEffect(() => {
    const savedIngredients = localStorage.getItem('aiMeals_recentIngredients');
    if (savedIngredients) {
      try {
        setIngredients(JSON.parse(savedIngredients));
      } catch (e) {
        console.error('Failed to load saved ingredients:', e);
      }
    }
  }, []);

  // Saves ingredients to localStorage when they change.
  useEffect(() => {
    if (ingredients.length > 0) {
      localStorage.setItem(
        'aiMeals_recentIngredients',
        JSON.stringify(ingredients)
      );
    }
  }, [ingredients]);

  return { ingredients, setIngredients };
}
