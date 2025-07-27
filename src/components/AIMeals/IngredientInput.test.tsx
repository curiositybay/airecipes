import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import IngredientInput from './IngredientInput';
import { mocks } from '@/test-utils/mocks';

// Mock fetch
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Setup utility functions
function setup(customProps = {}) {
  const props = {
    ingredients: ['tomato', 'onion'],
    setIngredients: jest.fn(),
    setError: jest.fn(),
    ...customProps,
  };

  render(<IngredientInput {...props} />);
  const input = screen.getByPlaceholderText(
    /start typing to search ingredients/i
  );

  return { input, props };
}

async function typeAndWait(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
  act(() => jest.advanceTimersByTime(500));
  await waitFor(() => expect(screen.getByText(value)).toBeInTheDocument());
}

function advanceTimers(ms: number = 500) {
  act(() => jest.advanceTimersByTime(ms));
}

function getSuggestionDiv(name: string) {
  return screen.getByText(name).closest('div');
}

describe('IngredientInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle removing an ingredient', () => {
    const { props } = setup();

    const removeButtons = screen.getAllByRole('button', {
      name: /remove tomato/i,
    });
    fireEvent.click(removeButtons[0]);

    expect(props.setIngredients).toHaveBeenCalledWith(['onion']);
  });

  it('should handle suggestion click', async () => {
    mocks.mock.ingredients.mockFetchSequence(
      {
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      }
    );

    const { input, props } = setup();
    await typeAndWait(input, 'garlic');

    await waitFor(() => {
      const suggestion = screen.getByText('garlic');
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
      expect(props.setIngredients).toHaveBeenCalledWith([
        'tomato',
        'onion',
        'garlic',
      ]);
    });
  });

  describe('keyboard navigation', () => {
    test.each([
      {
        name: 'basic navigation with escape',
        suggestions: mocks.mock.ingredients.mockSuggestions.basic,
        input: 'garlic',
        actions: [
          { key: 'ArrowDown', expectHighlighted: 'garlic' },
          { key: 'ArrowUp', expectNotHighlighted: 'garlic' },
          { key: 'Escape', expectHidden: 'garlic' },
        ],
      },
      {
        name: 'multi-step navigation without assertions',
        suggestions: mocks.mock.ingredients.mockSuggestions.basic,
        input: 'garlic',
        actions: [
          { key: 'ArrowDown' }, // index 0
          { key: 'ArrowDown' }, // index 1
          { key: 'ArrowDown' }, // index 2
          { key: 'ArrowUp' }, // index 1
          { key: 'ArrowUp' }, // index 0
          { key: 'ArrowUp' }, // index -1
        ],
      },
      {
        name: 'ArrowUp when index > 0 (garlic/ginger/carrot)',
        suggestions: mocks.mock.ingredients.mockSuggestions.carrot,
        input: 'garlic',
        actions: [
          { key: 'ArrowDown' }, // index 0
          { key: 'ArrowDown' }, // index 1
          { key: 'ArrowDown', expectHighlighted: 'carrot' }, // index 2
          { key: 'ArrowUp', expectHighlighted: 'ginger' }, // index 1 (prev > 0 branch)
        ],
      },
      {
        name: 'ArrowUp when index > 0 (chicken set)',
        suggestions: mocks.mock.ingredients.mockSuggestions.chicken,
        input: 'chicken',
        actions: [
          { key: 'ArrowDown', expectHighlighted: 'chicken' }, // index 0
          { key: 'ArrowDown', expectHighlighted: 'chicken breast' }, // index 1
          { key: 'ArrowDown', expectHighlighted: 'chicken eggs' }, // index 2
          { key: 'ArrowUp', expectHighlighted: 'chicken breast' }, // index 1 (prev > 0 branch)
        ],
      },
    ])('$name', async ({ suggestions, input, actions }) => {
      mocks.mock.ingredients.mockFetchSuggestions(suggestions);
      const { input: inputEl } = setup();
      await typeAndWait(inputEl, input);

      for (const action of actions) {
        fireEvent.keyDown(document, { key: action.key });

        if ('expectHighlighted' in action && action.expectHighlighted) {
          await waitFor(() => {
            const suggestion = getSuggestionDiv(action.expectHighlighted);
            expect(suggestion).toHaveClass('theme-bg-surface-secondary');
          });
        } else if (
          'expectNotHighlighted' in action &&
          action.expectNotHighlighted
        ) {
          await waitFor(() => {
            const suggestion = getSuggestionDiv(action.expectNotHighlighted);
            expect(suggestion).not.toHaveClass('theme-bg-surface-secondary');
          });
        } else if ('expectHidden' in action && action.expectHidden) {
          await waitFor(() => {
            expect(
              screen.queryByText(action.expectHidden)
            ).not.toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Enter key handling', () => {
    it('should handle Enter key with selected suggestion', async () => {
      mocks.mock.ingredients.mockFetchSequence(
        {
          ok: true,
          json: () =>
            Promise.resolve({
              ingredients:
                mocks.mock.ingredients.mockIngredientResponse('garlic'),
            }),
        },
        {
          ok: true,
          json: () =>
            Promise.resolve({
              ingredients:
                mocks.mock.ingredients.mockIngredientResponse('garlic'),
            }),
        }
      );

      const { input, props } = setup();
      await typeAndWait(input, 'garlic');

      // Select first suggestion
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Press Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(props.setIngredients).toHaveBeenCalledWith([
          'tomato',
          'onion',
          'garlic',
        ]);
      });
    });

    it('should handle Enter key when suggestions are hidden', async () => {
      mocks.mock.ingredients.mockFetchSequence({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      });

      const { input, props } = setup();
      await typeAndWait(input, 'garlic');

      // Hide suggestions by pressing Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('garlic')).not.toBeInTheDocument();
      });

      // Mock fetch for ingredient existence check
      mocks.mock.ingredients.mockFetchSequence({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      });

      // Now press Enter when suggestions are hidden
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(props.setIngredients).toHaveBeenCalledWith([
          'tomato',
          'onion',
          'garlic',
        ]);
      });
    });

    it('should handle Enter key with input value when no suggestions shown', async () => {
      mocks.mock.ingredients.mockFetchSequence({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      });

      const { input, props } = setup();
      fireEvent.change(input, { target: { value: 'garlic' } });

      // Press Enter immediately without waiting for suggestions to appear
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(props.setIngredients).toHaveBeenCalledWith([
          'tomato',
          'onion',
          'garlic',
        ]);
      });
    });

    it('should handle non-Enter key press in input (cover false branch of Enter check)', async () => {
      const { input, props } = setup();

      // Press a non-Enter key (like 'Tab' or 'Space')
      fireEvent.keyDown(input, { key: 'Tab' });

      // The function should complete without any side effects
      // No ingredients should be added
      expect(props.setIngredients).not.toHaveBeenCalled();
    });
  });

  it('should handle 429 rate limit error', async () => {
    mocks.mock.ingredients.mockFetchError(429);

    const { input, props } = setup();
    fireEvent.change(input, { target: { value: 'garlic' } });

    advanceTimers(500);

    await waitFor(() => {
      expect(props.setError).toHaveBeenCalledWith(
        'Search is temporarily limited. Please wait a moment before typing again.'
      );
    });
  });

  describe('edge cases', () => {
    test.each([
      ['empty input', '   ', 'Enter'],
      ['duplicate input', 'tomato', 'Enter'],
    ])('should prevent adding %s', async (caseName, inputValue, key) => {
      if (caseName === 'duplicate input') {
        mocks.mock.ingredients.mockFetchSequence({
          ok: true,
          json: () =>
            Promise.resolve({
              ingredients:
                mocks.mock.ingredients.mockIngredientResponse('tomato'),
            }),
        });
      }

      const { input, props } = setup();
      fireEvent.change(input, { target: { value: inputValue } });

      if (caseName === 'duplicate input') {
        advanceTimers(500);

        await waitFor(() => {
          expect(screen.getByText('tomato')).toBeInTheDocument();
        });
      }

      fireEvent.keyDown(input, { key });

      expect(props.setIngredients).not.toHaveBeenCalled();
    });

    it('should prevent adding ingredients when limit reached', async () => {
      const tenIngredients = Array.from(
        { length: 10 },
        (_, i) => `ingredient${i}`
      );
      mocks.mock.ingredients.mockFetchSequence({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      });

      const { input, props } = setup({ ingredients: tenIngredients });
      await typeAndWait(input, 'garlic');

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(props.setError).toHaveBeenCalledWith(
        'You can add up to 10 ingredients only. Please remove one before adding another.'
      );
    });
  });

  describe('API error handling', () => {
    it('should handle non-200 response from search API', async () => {
      mocks.mock.ingredients.mockFetchError(500);

      const { input } = setup();
      fireEvent.change(input, { target: { value: 'garlic' } });

      advanceTimers(500);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to search ingredients:',
          expect.any(Error)
        );
      });
    });

    it('should handle 429 rate limit error in checkIngredientExists', async () => {
      // Mock successful search for suggestions first
      mocks.mock.ingredients.mockFetchSequence(
        {
          ok: true,
          json: () =>
            Promise.resolve({
              ingredients:
                mocks.mock.ingredients.mockIngredientResponse('garlic'),
            }),
        },
        new Error('HTTP error! status: 429')
      );

      const { input, props } = setup();
      await typeAndWait(input, 'garlic');

      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(props.setError).toHaveBeenCalledWith(
          'Search is temporarily limited. Please wait a moment before adding ingredients.'
        );
      });
    });

    it('should handle non-200 response in checkIngredientExists', async () => {
      // Mock successful search for suggestions
      mocks.mock.ingredients.mockFetchSequence(
        {
          ok: true,
          json: () =>
            Promise.resolve({
              ingredients:
                mocks.mock.ingredients.mockIngredientResponse('garlic'),
            }),
        },
        {
          ok: false,
          status: 500,
        }
      );

      const { input } = setup();
      await typeAndWait(input, 'garlic');

      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to check ingredient existence:',
          expect.any(Error)
        );
      });
    });
  });

  describe('input behavior', () => {
    it('should handle input blur with timeout', async () => {
      mocks.mock.ingredients.mockFetchSuggestions(
        mocks.mock.ingredients.mockIngredientResponse('garlic')
      );

      const { input } = setup();
      await typeAndWait(input, 'garlic');

      fireEvent.blur(input);

      // Should still show suggestions immediately after blur
      expect(screen.getByText('garlic')).toBeInTheDocument();

      // Should hide suggestions after timeout
      advanceTimers(200);

      await waitFor(() => {
        expect(screen.queryByText('garlic')).not.toBeInTheDocument();
      });
    });

    it('should not search when input is empty', async () => {
      const { input } = setup();
      fireEvent.change(input, { target: { value: 'garlic' } });
      fireEvent.change(input, { target: { value: '' } });

      advanceTimers(500);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
