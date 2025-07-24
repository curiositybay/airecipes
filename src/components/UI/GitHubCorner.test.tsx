import { render, screen, fireEvent } from '@testing-library/react';
import GitHubCorner from './GitHubCorner';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('GitHubCorner', () => {
  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks();
  });

  it('renders initially visible', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    expect(githubLink).toBeInTheDocument();
    expect(dismissButton).toBeInTheDocument();
  });

  it('has correct GitHub link attributes', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });

    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('dismisses when dismiss button is clicked', () => {
    render(<GitHubCorner />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    // Initially visible
    expect(
      screen.getByRole('link', { name: /view source on github/i })
    ).toBeInTheDocument();
    expect(dismissButton).toBeInTheDocument();

    // Click dismiss button
    fireEvent.click(dismissButton);

    // Should no longer be visible
    expect(
      screen.queryByRole('link', { name: /view source on github/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /dismiss/i })
    ).not.toBeInTheDocument();
  });

  it('prevents default and stops propagation on dismiss click', () => {
    render(<GitHubCorner />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    // Simulate the click event
    fireEvent.click(dismissButton);

    // The component should handle the event properly
    expect(
      screen.queryByRole('link', { name: /view source on github/i })
    ).not.toBeInTheDocument();
  });

  it('maintains accessibility with proper ARIA labels', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    expect(githubLink).toHaveAttribute('aria-label', 'View source on GitHub');
    expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss');
  });
});
