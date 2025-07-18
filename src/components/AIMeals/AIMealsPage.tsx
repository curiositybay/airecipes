'use client';

import { useState, useEffect } from 'react';
import { PrimaryButton, SecondaryButton, ButtonIcon } from '../UI/Button';
import IngredientInput from './IngredientInput';
import RecipeResults from './RecipeResults';
import { Recipe } from '@/types/ai-meals';

function AIMealsPage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFallbackRecipes, setIsFallbackRecipes] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState('');

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

  const handleGetRecipes = async (
    ingredientsToUse?: string[]
  ): Promise<void> => {
    const ingredientsList = ingredientsToUse || ingredients;

    if (ingredientsList.length === 0) {
      setError('Please add at least one ingredient');
      return;
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
      setRecipes(data.recipes || []);

      // Handle fallback recipes
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

  const handleSurpriseMe = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/v1/ingredients/random');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const randomIngredients = data.ingredients.map(
        (ingredient: { name: string }) => ingredient.name
      );

      setIngredients(randomIngredients);

      // Auto-trigger recipe generation with the random ingredients
      await handleGetRecipes(randomIngredients);
    } catch (err) {
      setError('Failed to get random ingredients. Please try again.');
      console.error('Random ingredients error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = (): void => {
    setIngredients([]);
    setRecipes([]);
    setError('');
    setIsFallbackRecipes(false);
    setFallbackMessage('');
  };

  return (
    <>
      {/* Hero Section */}
      <section className='ai-meals-hero bg-gradient-to-br from-slate-50 via-white to-slate-100'>
        <div className='ai-meals-hero-content'>
          <div className='ai-meals-icons'>
            <i className='fas fa-robot text-6xl md:text-8xl mr-8 theme-text-icon-primary'></i>
            <i className='fas fa-utensils text-6xl md:text-8xl theme-text-icon-primary'></i>
          </div>
          <h1 className='ai-meals-title'>
            AI Recipe Generator by Curiosity Bay
          </h1>
          <p className='ai-meals-subtitle'>
            Turn your ingredients into delicious meals with AI-powered recipe
            suggestions
          </p>
        </div>
      </section>
      {/* Main Content */}
      <section className='ai-meals-main'>
        <div className='ai-meals-container'>
          {/* Input Section */}
          <div className='ai-meals-input-section'>
            <h2 className='ai-meals-section-title'>
              What ingredients do you have?
            </h2>

            <IngredientInput
              ingredients={ingredients}
              setIngredients={setIngredients}
              setError={setError}
            />

            <div className='ai-meals-actions'>
              <PrimaryButton
                onClick={() => handleGetRecipes()}
                disabled={isLoading}
                className='ai-meals-primary-btn'
              >
                <ButtonIcon
                  icon={isLoading ? 'fa-spinner fa-spin' : 'fa-magic'}
                />
                {isLoading ? 'Generating Recipes...' : 'Get Recipes'}
              </PrimaryButton>

              <SecondaryButton
                onClick={handleSurpriseMe}
                className='ai-meals-secondary-btn'
              >
                <ButtonIcon icon='fa-random' />
                Surprise Me
              </SecondaryButton>

              <button
                onClick={handleClearAll}
                className='ai-meals-clear-btn'
                disabled={ingredients.length === 0 && recipes.length === 0}
              >
                <i className='fas fa-trash mr-2'></i>
                Clear All
              </button>
            </div>

            {error && (
              <div className='ai-meals-error'>
                <i className='fas fa-exclamation-triangle mr-2'></i>
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {recipes.length > 0 && (
            <div className='ai-meals-results-section' id='recipe-suggestions'>
              <h2 className='ai-meals-section-title'>Recipe Suggestions</h2>

              {/* Fallback recipes warning */}
              {isFallbackRecipes && (
                <div className='ai-meals-fallback-warning'>
                  <i className='fas fa-info-circle mr-2 theme-text-icon-secondary'></i>
                  {fallbackMessage}
                </div>
              )}

              <RecipeResults recipes={recipes} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AIMealsPage;
