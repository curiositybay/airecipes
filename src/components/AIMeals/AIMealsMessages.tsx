interface AIMealsMessagesProps {
  error: string;
  isFallbackRecipes: boolean;
  fallbackMessage: string;
}

/**
 * Messages component for displaying errors and fallback notifications.
 */
export default function AIMealsMessages({
  error,
  isFallbackRecipes,
  fallbackMessage,
}: AIMealsMessagesProps) {
  return (
    <>
      {error && (
        <div className='ai-meals-error'>
          <i className='fas fa-exclamation-triangle mr-2'></i>
          {error}
        </div>
      )}

      {isFallbackRecipes && fallbackMessage && (
        <div className='ai-meals-fallback'>
          <i className='fas fa-info-circle mr-2'></i>
          {fallbackMessage}
        </div>
      )}
    </>
  );
}
