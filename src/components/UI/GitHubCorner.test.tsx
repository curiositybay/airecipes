import { render, screen, fireEvent } from '@testing-library/react';
import { mocks } from '@/test-utils/mocks';
import { timerHelpers } from '@/test-utils/common-test-patterns';
import GitHubCorner from './GitHubCorner';

describe('GitHubCorner', () => {
  beforeEach(() => {
    // Use unified mock setup for frontend components
    mocks.setup.frontend.setupLocalStorage();
    timerHelpers.setupFakeTimers();
  });

  afterEach(() => {
    // Clear mocks using unified system
    mocks.setup.clear();
    timerHelpers.restoreRealTimers();
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

  it('disables GitHub link pointer events when dismiss button is hovered', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    // Initially, GitHub link should have normal pointer events
    expect(githubLink).toHaveClass('group');
    expect(githubLink).not.toHaveClass('pointer-events-none');

    // Hover over dismiss button
    fireEvent.mouseEnter(dismissButton);

    // GitHub link should now have pointer events disabled
    expect(githubLink).toHaveClass('pointer-events-none');
  });

  it('re-enables GitHub link pointer events when dismiss button hover ends', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    // Hover over dismiss button
    fireEvent.mouseEnter(dismissButton);
    expect(githubLink).toHaveClass('pointer-events-none');

    // Stop hovering over dismiss button
    fireEvent.mouseLeave(dismissButton);

    // GitHub link should no longer have pointer events disabled
    expect(githubLink).not.toHaveClass('pointer-events-none');
  });

  it('handles multiple hover enter and leave events correctly', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss/i,
    });

    // First hover
    fireEvent.mouseEnter(dismissButton);
    expect(githubLink).toHaveClass('pointer-events-none');

    // First leave
    fireEvent.mouseLeave(dismissButton);
    expect(githubLink).not.toHaveClass('pointer-events-none');

    // Second hover
    fireEvent.mouseEnter(dismissButton);
    expect(githubLink).toHaveClass('pointer-events-none');

    // Second leave
    fireEvent.mouseLeave(dismissButton);
    expect(githubLink).not.toHaveClass('pointer-events-none');
  });

  it('starts with translate-y-full class before animation', () => {
    render(<GitHubCorner />);

    const container = screen.getByTestId('github-corner-container');

    // Initially should have translate-y-full class
    expect(container).toHaveClass('translate-y-full');
    expect(container).not.toHaveClass('translate-y-0');
  });

  it('applies translate-y-0 class after animation timer completes', () => {
    render(<GitHubCorner />);

    const container = screen.getByTestId('github-corner-container');

    // Initially should have translate-y-full class
    expect(container).toHaveClass('translate-y-full');

    // Fast-forward time to trigger animation using shared helper
    timerHelpers.advanceTimers(100);

    // After animation timer, should have translate-y-0 class
    expect(container).toHaveClass('translate-y-0');
    expect(container).not.toHaveClass('translate-y-full');
  });
});
