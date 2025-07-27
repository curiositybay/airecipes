'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IngredientInputProps } from '@/types/ai-meals';

interface IngredientSuggestion {
  name: string;
  category: string;
}

function IngredientInput({
  ingredients,
  setIngredients,
  setError,
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchIngredientsDebounced = useCallback(
    async (query: string): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1/ingredients/search?q=${encodeURIComponent(query)}&limit=8`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const filteredSuggestions = data.ingredients
          .filter(
            (ingredient: { name: string }) =>
              !ingredients.includes(ingredient.name)
          )
          .map((ingredient: { name: string; category: string }) => ({
            name: ingredient.name,
            category: ingredient.category,
          }));

        setSuggestions(filteredSuggestions);
        setShowSuggestions(filteredSuggestions.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error('Failed to search ingredients:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        if (error instanceof Error && error.message.includes('429')) {
          setError(
            'Search is temporarily limited. Please wait a moment before typing again.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [ingredients, setError]
  );

  const checkIngredientExists = async (
    ingredientName: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/v1/ingredients/search?q=${encodeURIComponent(ingredientName)}&limit=1`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.ingredients.some(
        (ingredient: { name: string }) =>
          ingredient.name.toLowerCase() === ingredientName.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to check ingredient existence:', error);
      if (error instanceof Error && error.message.includes('429')) {
        setError(
          'Search is temporarily limited. Please wait a moment before adding ingredients.'
        );
      }
      return false;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim()) {
        searchIngredientsDebounced(inputValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, ingredients, searchIngredientsDebounced]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => {
            if (prev < suggestions.length - 1) {
              return prev + 1;
            }
            return prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => {
            if (prev > 0) {
              return prev - 1;
            }
            return -1;
          });
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, selectedSuggestionIndex, suggestions]);

  const addIngredient = async (ingredient: string): Promise<void> => {
    const trimmedIngredient = ingredient.trim().toLowerCase();
    if (trimmedIngredient && !ingredients.includes(trimmedIngredient)) {
      if (ingredients.length >= 10) {
        setError(
          'You can add up to 10 ingredients only. Please remove one before adding another.'
        );
        return;
      }
      const existsInDb = await checkIngredientExists(trimmedIngredient);

      if (!existsInDb) {
        setError(
          `"${trimmedIngredient}" is not in our database. Custom foods are disabled. Please select from the suggestions or pick a different ingredient.`
        );
        return;
      }

      setIngredients([...ingredients, trimmedIngredient]);
      setInputValue('');
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      setError('');
    }
  };

  const removeIngredient = (indexToRemove: number): void => {
    setIngredients(
      ingredients.filter((_: string, index: number) => index !== indexToRemove)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
    setError('');
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        addIngredient(suggestions[selectedSuggestionIndex].name);
      } else if (inputValue.trim()) {
        addIngredient(inputValue.trim());
      }
    }
  };

  const handleSuggestionClick = (suggestion: IngredientSuggestion): void => {
    addIngredient(suggestion.name);
  };

  const handleInputBlur = (): void => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  return (
    <div className='space-y-4'>
      {ingredients.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {ingredients.map((ingredient, index) => (
            <div key={index} className='ingredient-pill'>
              <span className='mr-2' data-testid={`ingredient-${index}`}>
                {ingredient}
              </span>
              <button
                type='button'
                onClick={() => removeIngredient(index)}
                className='ingredient-pill-remove'
                aria-label={`Remove ${ingredient}`}
              >
                <i className='fas fa-times'></i>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder='Start typing to search ingredients...'
          className='w-full px-4 py-3 border theme-border-input rounded-lg focus:outline-none focus:ring-2 theme-input-focus disabled:opacity-50 disabled:cursor-not-allowed theme-bg-input theme-text-primary theme-input-placeholder'
          disabled={ingredients.length >= 10}
          data-testid='ingredient-input'
        />
        {isLoading && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <i className='fas fa-spinner fa-spin theme-text-icon-primary'></i>
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className='absolute z-10 w-full theme-bg-card border theme-border-input rounded-lg shadow-lg max-h-60 overflow-y-auto'
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`w-full px-4 py-3 text-left theme-text-primary hover:theme-bg-surface-hover transition-colors duration-200 flex items-center justify-between cursor-pointer ${
                  index === selectedSuggestionIndex
                    ? 'theme-bg-surface-secondary'
                    : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className='font-medium'>{suggestion.name}</span>
                <span className='ingredient-category-pill'>
                  {suggestion.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IngredientInput;
