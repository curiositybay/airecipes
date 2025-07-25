// Mock the ServerErrorPage component before importing anything
jest.mock('@/components/UI/ServerErrorPage', () => {
  return function MockServerErrorPage({ reset }: { reset: () => void }) {
    return (
      <div data-testid="server-error-page">
        <h1>Server Error</h1>
        <p>Something went wrong</p>
        <button onClick={reset}>Try Again</button>
        <button onClick={() => {}}>Return to Home</button>
      </div>
    );
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Error from './error';

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



  it('renders error content and handles interactions', () => {
    render(<Error error={error} reset={reset} />);
    
    // Test that content exists (not specific text)
    expect(screen.getByTestId('server-error-page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to/ })).toBeInTheDocument();
    
    // Test reset functionality
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(reset).toHaveBeenCalled();
  });
});
