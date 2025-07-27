import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ServerErrorPage from './ServerErrorPage';

// Mock Next.js router.
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the app config.
jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'TestApp',
    errorMessages: {
      serverError: 'Something went wrong on our end. Please try again later.',
    },
  },
}));

// Mock the Button components.
jest.mock('@/components/UI/Button', () => ({
  PrimaryButton: ({
    children,
    onClick,
    icon,
    className,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    icon?: string;
    className?: string;
  }>) => (
    <button onClick={onClick} className={className} {...props}>
      {icon && <i className={`fas ${icon}`} data-testid={`icon-${icon}`} />}
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    icon,
    className,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    icon?: string;
    className?: string;
  }>) => (
    <button onClick={onClick} className={className} {...props}>
      {icon && <i className={`fas ${icon}`} data-testid={`icon-${icon}`} />}
      {children}
    </button>
  ),
}));

// Mock the ErrorPage component.
jest.mock('./ErrorPage', () => {
  return function MockErrorPage({
    code,
    title,
    message,
    icon,
    showGoBack,
    customActions,
  }: {
    code: number;
    title: string;
    message: string;
    icon: string;
    showGoBack: boolean;
    customActions: React.ReactNode;
  }) {
    return (
      <div data-testid='error-page'>
        <div data-testid='error-code'>{code}</div>
        <div data-testid='error-title'>{title}</div>
        <div data-testid='error-message'>{message}</div>
        <div data-testid='error-icon'>{icon}</div>
        <div data-testid='show-go-back'>{showGoBack.toString()}</div>
        <div data-testid='custom-actions'>{customActions}</div>
      </div>
    );
  };
});

describe('ServerErrorPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('calls reset function when Try Again button is clicked', () => {
    const reset = jest.fn();
    render(<ServerErrorPage reset={reset} />);

    fireEvent.click(screen.getByText('Try Again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('navigates to home page when Return to Home button is clicked', () => {
    // Mock window.history.length to simulate browser history.
    const originalHistory = window.history.length;
    Object.defineProperty(window.history, 'length', {
      value: 2,
      configurable: true,
    });

    const reset = jest.fn();
    render(<ServerErrorPage reset={reset} />);

    fireEvent.click(screen.getByText('Return to TestApp'));
    expect(mockRouter.push).toHaveBeenCalledWith('/');

    // Restore original history length.
    Object.defineProperty(window.history, 'length', {
      value: originalHistory,
      configurable: true,
    });
  });

  it('does not render Return to Home button when no browser history exists', () => {
    // Mock window.history.length to simulate no browser history.
    const originalHistory = window.history.length;
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    });

    const reset = jest.fn();
    render(<ServerErrorPage reset={reset} />);

    expect(screen.queryByText('Return to TestApp')).not.toBeInTheDocument();

    // Restore original history length.
    Object.defineProperty(window.history, 'length', {
      value: originalHistory,
      configurable: true,
    });
  });

  it('handles useEffect cleanup properly', () => {
    const reset = jest.fn();
    const { unmount } = render(<ServerErrorPage reset={reset} />);

    // Component should render without errors.
    expect(screen.getByTestId('error-page')).toBeInTheDocument();

    // Unmount should not cause errors.
    unmount();
  });
});
