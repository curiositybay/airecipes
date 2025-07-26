import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Unmock AuthContext for this test to test the actual implementation
jest.unmock('@/contexts/AuthContext');
import { AuthProvider, useAuth } from './AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Test component to access context
function TestComponent() {
  const { user, isLoading, error, setRedirecting } = useAuth();

  return (
    <div>
      <div data-testid='user'>{user ? user.email : 'no-user'}</div>
      <div data-testid='loading'>{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid='error'>{error || 'no-error'}</div>
      <button onClick={() => setRedirecting(true)}>Set Redirecting</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should provide initial user when passed', () => {
    const mockUser = {
      email: 'test@example.com',
      id: '1',
      role: 'read-only' as const,
      app_name: 'airecipes',
    };

    render(
      <AuthProvider initialUser={mockUser}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('should handle setRedirecting', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByText('Set Redirecting');
    act(() => {
      button.click();
    });

    // The setRedirecting function should work without throwing errors
    expect(button).toBeInTheDocument();
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
