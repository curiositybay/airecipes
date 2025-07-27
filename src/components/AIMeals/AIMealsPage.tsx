'use client';

import IngredientInput from './IngredientInput';
import RecipeResults from './RecipeResults';
import AIMealsHero from './AIMealsHero';
import AIMealsLayout from './AIMealsLayout';
import AIMealsActions from './AIMealsActions';
import AIMealsMessages from './AIMealsMessages';
import { useAIMealsStorage } from '@/hooks/useAIMealsStorage';
import { useAIMealsRecipeService } from '@/hooks/useAIMealsRecipeService';
import { useAIMealsSurpriseService } from '@/hooks/useAIMealsSurpriseService';

/**
 * Main AI Meals page component that orchestrates all functionality.
 */
function AIMealsPage() {
  const { ingredients, setIngredients } = useAIMealsStorage();
  const {
    recipes,
    isLoading,
    error,
    isFallbackRecipes,
    fallbackMessage,
    generateRecipes,
    clearRecipes,
  } = useAIMealsRecipeService();
  const { handleSurpriseMe } = useAIMealsSurpriseService(
    generateRecipes,
    setIngredients
  );

  const handleClearAll = (): void => {
    setIngredients([]);
    clearRecipes();
  };

  const handleGetRecipes = (): void => {
    generateRecipes(ingredients);
  };

  return (
    <>
      <AIMealsHero />
      <AIMealsLayout>
        <div className='ai-meals-input-section'>
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
            setError={() => {}} // Error handling is now managed by the recipe service.
          />

          <AIMealsActions
            onGetRecipes={handleGetRecipes}
            onSurpriseMe={handleSurpriseMe}
            onClearAll={handleClearAll}
            isLoading={isLoading}
            hasContent={ingredients.length > 0 || recipes.length > 0}
          />

          <AIMealsMessages
            error={error}
            isFallbackRecipes={isFallbackRecipes}
            fallbackMessage={fallbackMessage}
          />
        </div>

        {recipes.length > 0 && (
          <div className='ai-meals-results-section' id='recipe-suggestions'>
            <div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <div className='flex items-start'>
                <i className='fas fa-exclamation-triangle text-amber-600 mt-1 mr-3 flex-shrink-0'></i>
                <div className='text-sm text-amber-800'>
                  <p className='font-medium mb-1'>
                    AI suggestions may be inaccurate or inedible. Always follow
                    food safety and check for allergies.
                  </p>
                </div>
              </div>
            </div>

            <h2 className='ai-meals-section-title'>Recipe Suggestions</h2>
            <RecipeResults recipes={recipes} />
          </div>
        )}
      </AIMealsLayout>
    </>
  );
}

export default AIMealsPage;
