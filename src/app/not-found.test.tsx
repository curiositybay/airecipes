// Mock the config before importing anything
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Mock App',
    description: 'Mock description',
    errorMessages: {
      notFound: 'Mock not found',
      serverError: 'Mock server error',
    },
  },
}));

import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders not found content with navigation', () => {
    render(<NotFound />);
    
    // Test that content exists (not specific text)
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to/ })).toHaveAttribute('href', '/');
  });
});
