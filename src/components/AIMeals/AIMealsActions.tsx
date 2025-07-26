import { PrimaryButton, SecondaryButton } from '../UI/Button';

interface AIMealsActionsProps {
  onGetRecipes: () => void;
  onSurpriseMe: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  hasContent: boolean;
}

/**
 * Action buttons component for the AI Meals page.
 */
export default function AIMealsActions({
  onGetRecipes,
  onSurpriseMe,
  onClearAll,
  isLoading,
  hasContent,
}: AIMealsActionsProps) {
  return (
    <div className='ai-meals-actions'>
      <PrimaryButton
        onClick={onGetRecipes}
        disabled={isLoading}
        className='ai-meals-primary-btn'
      >
        {isLoading ? 'Generating Recipes...' : 'Get Recipes'}
      </PrimaryButton>

      <SecondaryButton
        onClick={onSurpriseMe}
        className='ai-meals-secondary-btn'
      >
        Surprise Me
      </SecondaryButton>

      <button
        onClick={onClearAll}
        className='ai-meals-clear-btn'
        disabled={!hasContent}
      >
        <i className='fas fa-trash mr-2'></i>
        Clear All
      </button>
    </div>
  );
}
