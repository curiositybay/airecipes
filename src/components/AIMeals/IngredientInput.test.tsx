import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import IngredientInput from './IngredientInput';

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

describe('IngredientInput', () => {
  const mockProps = {
    ingredients: ['tomato', 'onion'],
    setIngredients: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the component', () => {
    render(<IngredientInput {...mockProps} />);

    expect(
      screen.getByPlaceholderText(/start typing to search ingredients/i)
    ).toBeInTheDocument();
  });

  it('should display existing ingredients', () => {
    render(<IngredientInput {...mockProps} />);

    expect(screen.getByText('tomato')).toBeInTheDocument();
    expect(screen.getByText('onion')).toBeInTheDocument();
  });

  it('should handle input change', () => {
    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    expect(input).toHaveValue('garlic');
  });

  it('should handle removing an ingredient', () => {
    render(<IngredientInput {...mockProps} />);

    const removeButtons = screen.getAllByRole('button', {
      name: /remove tomato/i,
    });
    fireEvent.click(removeButtons[0]);

    expect(mockProps.setIngredients).toHaveBeenCalledWith(['onion']);
  });

  it('should clear error when input changes', () => {
    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    expect(mockProps.setError).toHaveBeenCalledWith('');
  });

  it('should not render ingredient pills when no ingredients', () => {
    render(<IngredientInput {...mockProps} ingredients={[]} />);

    expect(screen.queryByText('tomato')).not.toBeInTheDocument();
    expect(screen.queryByText('onion')).not.toBeInTheDocument();
  });

  it('should disable input when 10 ingredients are added', () => {
    const tenIngredients = Array.from(
      { length: 10 },
      (_, i) => `ingredient${i}`
    );
    render(<IngredientInput {...mockProps} ingredients={tenIngredients} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    expect(input).toBeDisabled();
  });

  it('should fetch suggestions after debounce delay', async () => {
    const mockSuggestions = [
      { name: 'garlic', category: 'vegetables' },
      { name: 'ginger', category: 'spices' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockSuggestions }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/ingredients/search?q=garlic&limit=8'
      );
    });
  });

  it('should display suggestions after successful fetch', async () => {
    const mockSuggestions = [
      { name: 'garlic', category: 'vegetables' },
      { name: 'ginger', category: 'spices' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockSuggestions }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
      expect(screen.getByText('ginger')).toBeInTheDocument();
      expect(screen.getByText('vegetables')).toBeInTheDocument();
      expect(screen.getByText('spices')).toBeInTheDocument();
    });
  });

  it('should handle suggestion click', async () => {
    const mockSuggestions = [{ name: 'garlic', category: 'vegetables' }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ingredients: mockSuggestions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients: [{ name: 'garlic', category: 'vegetables' }],
          }),
      });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      const suggestion = screen.getByText('garlic');
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
      expect(mockProps.setIngredients).toHaveBeenCalledWith([
        'tomato',
        'onion',
        'garlic',
      ]);
    });
  });

  it('should handle keyboard navigation', async () => {
    const mockSuggestions = [
      { name: 'garlic', category: 'vegetables' },
      { name: 'ginger', category: 'spices' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockSuggestions }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
    });

    // Test ArrowDown
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      const firstSuggestion = screen.getByText('garlic').closest('div');
      expect(firstSuggestion).toHaveClass('theme-bg-surface-secondary');
    });

    // Test ArrowUp
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    await waitFor(() => {
      const firstSuggestion = screen.getByText('garlic').closest('div');
      expect(firstSuggestion).not.toHaveClass('theme-bg-surface-secondary');
    });

    // Test Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('garlic')).not.toBeInTheDocument();
    });
  });

  it('should handle Enter key with selected suggestion', async () => {
    const mockSuggestions = [{ name: 'garlic', category: 'vegetables' }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ingredients: mockSuggestions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ingredients: [{ name: 'garlic', category: 'vegetables' }],
          }),
      });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
    });

    // Select first suggestion
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockProps.setIngredients).toHaveBeenCalledWith([
        'tomato',
        'onion',
        'garlic',
      ]);
    });
  });

  it('should handle Enter key with input value when no suggestion selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ingredients: [{ name: 'garlic', category: 'vegetables' }],
        }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
    });

    // Press Enter without selecting suggestion
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockProps.setIngredients).toHaveBeenCalledWith([
        'tomato',
        'onion',
        'garlic',
      ]);
    });
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to search ingredients:',
        expect.any(Error)
      );
    });
  });

  it('should handle 429 rate limit error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error('HTTP error! status: 429')
    );

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockProps.setError).toHaveBeenCalledWith(
        'Search is temporarily limited. Please wait a moment before typing again.'
      );
    });
  });

  it('should prevent adding duplicate ingredients', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ingredients: [{ name: 'tomato', category: 'vegetables' }],
        }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'tomato' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    // Should not add duplicate
    expect(mockProps.setIngredients).not.toHaveBeenCalled();
  });

  it('should prevent adding empty ingredients', async () => {
    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockProps.setIngredients).not.toHaveBeenCalled();
  });

  it('should prevent adding ingredients when limit reached', async () => {
    const tenIngredients = Array.from(
      { length: 10 },
      (_, i) => `ingredient${i}`
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ingredients: [{ name: 'garlic', category: 'vegetables' }],
        }),
    });

    render(<IngredientInput {...mockProps} ingredients={tenIngredients} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockProps.setError).toHaveBeenCalledWith(
      'You can add up to 10 ingredients only. Please remove one before adding another.'
    );
  });

  it('should handle input blur with timeout', async () => {
    const mockSuggestions = [{ name: 'garlic', category: 'vegetables' }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockSuggestions }),
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('garlic')).toBeInTheDocument();
    });

    fireEvent.blur(input);

    // Should still show suggestions immediately after blur
    expect(screen.getByText('garlic')).toBeInTheDocument();

    // Should hide suggestions after timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.queryByText('garlic')).not.toBeInTheDocument();
    });
  });

  it('should not search when input is empty', async () => {
    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });
    fireEvent.change(input, { target: { value: '' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle non-200 response from search API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<IngredientInput {...mockProps} />);

    const input = screen.getByPlaceholderText(
      /start typing to search ingredients/i
    );
    fireEvent.change(input, { target: { value: 'garlic' } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to search ingredients:',
        expect.any(Error)
      );
    });
  });
});
