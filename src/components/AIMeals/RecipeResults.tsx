'use client';

import { RecipeResultsProps } from '@/types/ai-meals';
import RecipeCard from './RecipeCard';

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
