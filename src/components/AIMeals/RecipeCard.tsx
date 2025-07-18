'use client';

import { useState } from 'react';
import { RecipeCardProps, Recipe } from '@/types/ai-meals';

function RecipeCard({ recipe, index }: RecipeCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (
    recipe: Recipe,
    index: number
  ): Promise<void> => {
    try {
      const recipeText = formatRecipeForCopy(recipe);
      await navigator.clipboard.writeText(recipeText);
      setCopiedIndex(index);

      // Resets copied state after 2 seconds.
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy recipe:', err);
    }
  };

  const formatRecipeForCopy = (recipe: Recipe): string => {
    let recipeText = `${recipe.name}\n\n`;

    // Recipe description.
    if (recipe.description) {
      recipeText += `${recipe.description}\n\n`;
    }

    // Recipe tags.
    if (recipe.tags && recipe.tags.length > 0) {
      recipeText += `Tags: ${recipe.tags.join(', ')}\n\n`;
    }

    // Recipe ingredients.
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipeText += `Ingredients:\n`;
      recipe.ingredients.forEach((ingredient: string) => {
        recipeText += `• ${ingredient}\n`;
      });
      recipeText += '\n';
    }

    // Recipe instructions.
    if (recipe.instructions && recipe.instructions.length > 0) {
      recipeText += `Instructions:\n`;
      recipe.instructions.forEach((instruction: string, index: number) => {
        recipeText += `${index + 1}. ${instruction}\n`;
      });
      recipeText += '\n';
    }

    // Recipe metadata.
    if (recipe.prepTime || recipe.difficulty || recipe.servings) {
      recipeText += `Details:\n`;
      if (recipe.prepTime) recipeText += `• Prep Time: ${recipe.prepTime}\n`;
      if (recipe.difficulty)
        recipeText += `• Difficulty: ${recipe.difficulty}\n`;
      if (recipe.servings) recipeText += `• Servings: ${recipe.servings}\n`;
      recipeText += '\n';
    }

    // Nutritional information.
    if (recipe.nutritionalInfo) {
      recipeText += `Nutritional Information:\n`;
      if (recipe.nutritionalInfo.calories)
        recipeText += `• Calories: ${recipe.nutritionalInfo.calories} cal\n`;
      if (recipe.nutritionalInfo.protein)
        recipeText += `• Protein: ${recipe.nutritionalInfo.protein}\n`;
      if (recipe.nutritionalInfo.carbs)
        recipeText += `• Carbs: ${recipe.nutritionalInfo.carbs}\n`;
      if (recipe.nutritionalInfo.fat)
        recipeText += `• Fat: ${recipe.nutritionalInfo.fat}\n`;
    }

    return recipeText;
  };

  return (
    <div className='theme-bg-surface theme-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col border hover:theme-border-hover hover:theme-bg-surface-hover'>
      <div className='flex-1'>
        {/* Recipe Header */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1 mr-4'>
            <h3 className='text-xl font-semibold theme-text-primary mb-2'>
              {recipe.name}
            </h3>
            {/* Recipe Metadata */}
            <div className='flex flex-wrap gap-3'>
              {recipe.prepTime && (
                <span className='text-sm theme-text-secondary flex items-center'>
                  <i className='fas fa-clock mr-1'></i>
                  {recipe.prepTime}
                </span>
              )}
              {recipe.difficulty && (
                <span className='text-sm theme-text-secondary flex items-center'>
                  <i className='fas fa-star mr-1'></i>
                  {recipe.difficulty}
                </span>
              )}
              {recipe.servings && (
                <span className='text-sm theme-text-secondary flex items-center'>
                  <i className='fas fa-users mr-1'></i>
                  {recipe.servings} servings
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => copyToClipboard(recipe, index)}
              className='w-8 h-8 rounded-full flex items-center justify-center theme-text-muted hover:theme-text-icon-primary transition-colors duration-200 hover:theme-bg-surface-secondary'
              title='Copy recipe'
            >
              <i
                className={`fas ${copiedIndex === index ? 'fa-check' : 'fa-copy'}`}
              ></i>
            </button>
          </div>
        </div>

        {/* Recipe Description */}
        <p className='theme-text-secondary mb-4 leading-relaxed'>
          {recipe.description}
        </p>

        {/* Recipe Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {recipe.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className='px-2 py-1 text-xs font-bold rounded-full theme-btn-primary'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Recipe Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className='space-y-2 mb-4'>
            <h4 className='text-sm font-semibold theme-text-primary mb-2'>
              Ingredients:
            </h4>
            <ul className='list-disc list-inside text-sm theme-text-secondary space-y-1'>
              {recipe.ingredients.map((ingredient, ingredientIndex) => (
                <li
                  key={ingredientIndex}
                  className='text-sm theme-text-secondary'
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recipe Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className='space-y-2 mb-4'>
            <h4 className='text-sm font-semibold theme-text-primary mb-2'>
              Instructions:
            </h4>
            <ol className='list-decimal list-inside text-sm theme-text-secondary space-y-1'>
              {recipe.instructions.map((instruction, instructionIndex) => (
                <li
                  key={instructionIndex}
                  className='text-sm theme-text-secondary'
                >
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Nutritional Information - Footer */}
      {recipe.nutritionalInfo && (
        <div className='mt-4 pt-4 theme-border-light border-t'>
          <h4 className='text-sm font-semibold theme-text-primary mb-2'>
            Nutritional Info:
          </h4>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {recipe.nutritionalInfo.calories && (
              <span className='text-sm theme-text-secondary flex items-center'>
                <i className='fas fa-fire mr-1 theme-text-icon-primary'></i>
                {recipe.nutritionalInfo.calories} cal
              </span>
            )}
            {recipe.nutritionalInfo.protein && (
              <span className='text-sm theme-text-secondary flex items-center'>
                <i className='fas fa-drumstick-bite mr-1 theme-text-icon-primary'></i>
                {recipe.nutritionalInfo.protein}
              </span>
            )}
            {recipe.nutritionalInfo.carbs && (
              <span className='text-sm theme-text-secondary flex items-center'>
                <i className='fas fa-bread-slice mr-1 theme-text-icon-primary'></i>
                {recipe.nutritionalInfo.carbs}
              </span>
            )}
            {recipe.nutritionalInfo.fat && (
              <span className='text-sm theme-text-secondary flex items-center'>
                <i className='fas fa-cheese mr-1 theme-text-icon-primary'></i>
                {recipe.nutritionalInfo.fat}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
