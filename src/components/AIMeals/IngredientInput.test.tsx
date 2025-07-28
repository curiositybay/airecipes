import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IngredientInput from './IngredientInput';
import { mocks } from '@/test-utils/mocks/mocks';
import { timerHelpers } from '@/test-utils/common-test-patterns';

global.fetch = jest.fn();

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

function setup(customProps = {}) {
  const props = {
    ingredients: ['tomato', 'onion'],
    setIngredients: jest.fn(),
    setError: jest.fn(),
    ...customProps,
  };

  render(<IngredientInput {...props} />);

  const input = screen.getByTestId('ingredient-input');

  return { input, props };
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
    await timerHelpers.typeAndWait(input, 'garlic');

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
          { key: 'ArrowDown' },
          { key: 'ArrowDown' },
          { key: 'ArrowDown' },
          { key: 'ArrowUp' },
          { key: 'ArrowUp' },
          { key: 'ArrowUp' },
        ],
      },
      {
        name: 'ArrowUp when index > 0 (garlic/ginger/carrot)',
        suggestions: mocks.mock.ingredients.mockSuggestions.carrot,
        input: 'garlic',
        actions: [
          { key: 'ArrowDown' },
          { key: 'ArrowDown' },
          { key: 'ArrowDown', expectHighlighted: 'carrot' },
          { key: 'ArrowUp', expectHighlighted: 'ginger' },
        ],
      },
      {
        name: 'ArrowUp when index > 0 (chicken set)',
        suggestions: mocks.mock.ingredients.mockSuggestions.chicken,
        input: 'chicken',
        actions: [
          { key: 'ArrowDown', expectHighlighted: 'chicken' },
          { key: 'ArrowDown', expectHighlighted: 'chicken breast' },
          { key: 'ArrowDown', expectHighlighted: 'chicken eggs' },
          { key: 'ArrowUp', expectHighlighted: 'chicken breast' },
        ],
      },
    ])('$name', async ({ suggestions, input, actions }) => {
      mocks.mock.ingredients.mockFetchSuggestions(suggestions);
      const { input: inputEl } = setup();
      await timerHelpers.typeAndWait(inputEl, input);

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
      await timerHelpers.typeAndWait(input, 'garlic');

      fireEvent.keyDown(document, { key: 'ArrowDown' });

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
      await timerHelpers.typeAndWait(input, 'garlic');

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('garlic')).not.toBeInTheDocument();
      });

      mocks.mock.ingredients.mockFetchSequence({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients:
              mocks.mock.ingredients.mockIngredientResponse('garlic'),
          }),
      });

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

      fireEvent.keyDown(input, { key: 'Tab' });

      expect(props.setIngredients).not.toHaveBeenCalled();
    });
  });

  it('should handle 429 rate limit error', async () => {
    mocks.mock.ingredients.mockFetchError(429);

    const { input, props } = setup();
    fireEvent.change(input, { target: { value: 'garlic' } });

    timerHelpers.advanceTimers(500);

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
        timerHelpers.advanceTimers(500);

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
      await timerHelpers.typeAndWait(input, 'garlic');

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

      timerHelpers.advanceTimers(500);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to search ingredients:',
          expect.any(Error)
        );
      });
    });

    it('should handle 429 rate limit error in checkIngredientExists', async () => {
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
      await timerHelpers.typeAndWait(input, 'garlic');

      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(props.setError).toHaveBeenCalledWith(
          'Search is temporarily limited. Please wait a moment before adding ingredients.'
        );
      });
    });

    it('should handle non-200 response in checkIngredientExists', async () => {
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
      await timerHelpers.typeAndWait(input, 'garlic');

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
      await timerHelpers.typeAndWait(input, 'garlic');

      fireEvent.blur(input);

      expect(screen.getByText('garlic')).toBeInTheDocument();

      timerHelpers.advanceTimers(200);

      await waitFor(() => {
        expect(screen.queryByText('garlic')).not.toBeInTheDocument();
      });
    });

    it('should not search when input is empty', async () => {
      const { input } = setup();
      fireEvent.change(input, { target: { value: 'garlic' } });
      fireEvent.change(input, { target: { value: '' } });

      timerHelpers.advanceTimers(500);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
