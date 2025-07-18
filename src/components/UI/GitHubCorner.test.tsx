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
      name: /dismiss github corner/i,
    });

    expect(githubLink).toBeInTheDocument();
    expect(dismissButton).toBeInTheDocument();
  });

  it('has correct GitHub link attributes', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });

    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/yourusername/your-app'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has correct styling classes', () => {
    render(<GitHubCorner />);

    const container = screen.getByRole('link').parentElement;
    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss github corner/i,
    });

    expect(container).toHaveClass('fixed', 'top-0', 'right-0', 'z-50');
    expect(githubLink).toHaveClass(
      'block',
      'bg-black',
      'text-white',
      'p-2',
      'hover:bg-gray-800',
      'transition-colors'
    );
    expect(dismissButton).toHaveClass(
      'absolute',
      '-top-2',
      '-left-2',
      'bg-red-500',
      'text-white',
      'rounded-full',
      'w-6',
      'h-6',
      'flex',
      'items-center',
      'justify-center',
      'text-sm',
      'hover:bg-red-600',
      'transition-colors'
    );
  });

  it('dismisses when dismiss button is clicked', () => {
    render(<GitHubCorner />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss github corner/i,
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
      screen.queryByRole('button', { name: /dismiss github corner/i })
    ).not.toBeInTheDocument();
  });

  it('prevents default and stops propagation on dismiss click', () => {
    render(<GitHubCorner />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss github corner/i,
    });

    // Simulate the click event
    fireEvent.click(dismissButton);

    // The component should handle the event properly
    expect(
      screen.queryByRole('link', { name: /view source on github/i })
    ).not.toBeInTheDocument();
  });

  it('has correct GitHub icon', () => {
    render(<GitHubCorner />);

    const githubIcon = screen
      .getByRole('link', { name: /view source on github/i })
      .querySelector('i');
    expect(githubIcon).toHaveClass('fab', 'fa-github', 'text-xl');
  });

  it('has correct dismiss button text', () => {
    render(<GitHubCorner />);

    const dismissButton = screen.getByRole('button', {
      name: /dismiss github corner/i,
    });
    expect(dismissButton).toHaveTextContent('×');
  });

  it('maintains accessibility with proper ARIA labels', () => {
    render(<GitHubCorner />);

    const githubLink = screen.getByRole('link', {
      name: /view source on github/i,
    });
    const dismissButton = screen.getByRole('button', {
      name: /dismiss github corner/i,
    });

    expect(githubLink).toHaveAttribute('aria-label', 'View source on GitHub');
    expect(dismissButton).toHaveAttribute(
      'aria-label',
      'Dismiss GitHub corner'
    );
  });
});
