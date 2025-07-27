'use client';

import { RecipeResultsProps } from '@/types/ai-meals';
import RecipeCard from './RecipeCard';

/**
 * Displays a grid of recipe cards for the provided recipes.
 */
function RecipeResults({ recipes }: RecipeResultsProps) {
  return (
    <div className='recipe-results'>
      <div className='recipe-grid'>
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} index={index} />
        ))}
      </div>
    </div>
  );
}

export default RecipeResults;
