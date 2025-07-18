import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from './ErrorPage';

jest.mock('@/config/app', () => ({
  appConfig: { name: 'TestApp' },
}));

jest.mock('@/components/UI/Button', () => ({
  PrimaryButton: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  SecondaryButton: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('ErrorPage', () => {
  const defaultProps = {
    code: 404,
    title: 'Not Found',
    message: 'The page could not be found.',
  };

  it('renders error code, title, and message', () => {
    render(<ErrorPage {...defaultProps} />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('The page could not be found.')
    ).toBeInTheDocument();
  });

  it('renders the default icon', () => {
    render(<ErrorPage {...defaultProps} />);
    expect(screen.getByTestId('error-icon')).toHaveClass(
      'fa-exclamation-triangle'
    );
  });

  it('renders a custom icon if provided', () => {
    render(<ErrorPage {...defaultProps} icon='fa-bug' />);
    expect(screen.getByTestId('error-icon')).toHaveClass('fa-bug');
  });

  it('renders the Return to app button', () => {
    render(<ErrorPage {...defaultProps} />);
    expect(screen.getByText('Return to TestApp')).toBeInTheDocument();
  });

  it('renders custom actions if provided', () => {
    render(
      <ErrorPage
        {...defaultProps}
        customActions={<div data-testid='custom-actions'>Custom</div>}
      />
    );
    expect(screen.getByTestId('custom-actions')).toBeInTheDocument();
    expect(screen.queryByText('Return to TestApp')).not.toBeInTheDocument();
  });

  it('shows Go Back button if showGoBack is true and history exists', () => {
    // Mock window.history.length
    const originalHistory = window.history.length;
    Object.defineProperty(window.history, 'length', {
      value: 2,
      configurable: true,
    });
    render(<ErrorPage {...defaultProps} showGoBack={true} />);
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    Object.defineProperty(window.history, 'length', {
      value: originalHistory,
      configurable: true,
    });
  });

  it('does not show Go Back button if showGoBack is false', () => {
    render(<ErrorPage {...defaultProps} showGoBack={false} />);
    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
  });

  it('does not show Go Back button if history does not exist', () => {
    // Mock window.history.length
    const originalHistory = window.history.length;
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    });
    render(<ErrorPage {...defaultProps} showGoBack={true} />);
    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
    Object.defineProperty(window.history, 'length', {
      value: originalHistory,
      configurable: true,
    });
  });

  it('calls window.history.back when Go Back button is clicked', () => {
    // Mock window.history.length and window.history.back
    const originalHistory = window.history.length;
    const backMock = jest.fn();
    Object.defineProperty(window.history, 'length', {
      value: 2,
      configurable: true,
    });
    const originalBack = window.history.back;
    window.history.back = backMock;
    render(<ErrorPage {...defaultProps} showGoBack={true} />);
    fireEvent.click(screen.getByText('Go Back'));
    expect(backMock).toHaveBeenCalled();
    window.history.back = originalBack;
    Object.defineProperty(window.history, 'length', {
      value: originalHistory,
      configurable: true,
    });
  });
});
