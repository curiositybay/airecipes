import { render, screen, fireEvent } from '@testing-library/react';
import Error from './error';
import * as navigation from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    length: 2, // Simulate having history to go back to
  },
  writable: true,
});

describe('Error page', () => {
  const error: Error & { digest?: string } = {
    name: 'Error',
    message: 'Test error',
    digest: undefined,
    stack: '',
  };
  const reset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message and buttons', () => {
    render(<Error error={error} reset={reset} />);
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Try Again/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Return to/ })
    ).toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', () => {
    render(<Error error={error} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(reset).toHaveBeenCalled();
  });

  it('navigates home when Return to is clicked', () => {
    const mockPush = jest.fn();
    const mockUseRouter = jest.fn(() => ({ push: mockPush }));
    (navigation.useRouter as jest.Mock).mockImplementation(mockUseRouter);

    render(<Error error={error} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /Return to/ }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
