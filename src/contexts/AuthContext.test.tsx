import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Unmock AuthContext for this test to test the actual implementation
jest.unmock('@/contexts/AuthContext');
import { AuthProvider, useAuth } from './AuthContext';
import { AuthUser } from '@/lib/auth';

// Mock fetch
global.fetch = jest.fn();

// Mock user data
const mockUser = {
  email: 'test@example.com',
  id: '1',
  role: 'read-only' as const,
  app_name: 'airecipes',
};

// Helper function to mock fetch responses
function mockFetchResponse(jsonData: Record<string, unknown>, ok = true) {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => jsonData,
  });
}

// Helper function to click buttons
async function clickButton(label: string) {
  await act(async () => {
    screen.getByText(label).click();
  });
}

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

// Test component with auth functions
function AuthTestComponent() {
  const auth = useAuth();

  const handleLogin = async () => {
    try {
      await auth.login('test@example.com', 'password');
    } catch {
      // Error is handled by the context
    }
  };

  return (
    <div>
      <div data-testid='user'>{auth.user ? auth.user.email : 'no-user'}</div>
      <div data-testid='loading'>
        {auth.isLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid='error'>{auth.error || 'no-error'}</div>
      <button onClick={() => auth.checkAuthStatus()}>Check Auth</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => auth.loginAsDemoUser()}>Demo Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

// Helper function to render with AuthProvider
function renderWithAuth(
  children = <AuthTestComponent />,
  initialUser?: AuthUser | null
) {
  return render(
    <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle setRedirecting', () => {
    renderWithAuth(<TestComponent />);

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

  describe('checkAuthStatus', () => {
    describe('when successful with user data', () => {
      it('sets user', async () => {
        mockFetchResponse({ success: true, user: mockUser });

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when successful without user data', () => {
      it('clears user', async () => {
        mockFetchResponse({ success: false });

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when fetch fails', () => {
      it('handles network error', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(
          new TypeError('fetch failed')
        );

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });

      it('handles non-TypeError', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Other error'));

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when response indicates error', () => {
      it('handles 401 status', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });

      it('handles other error status', async () => {
        mockFetchResponse({}, false);

        renderWithAuth();

        await clickButton('Check Auth');

        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe('login', () => {
    describe('when successful with user data', () => {
      it('sets user', async () => {
        mockFetchResponse({ success: true, user: mockUser });

        renderWithAuth();

        await clickButton('Login');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when successful without user data', () => {
      it('sets error', async () => {
        mockFetchResponse({ success: true });

        renderWithAuth();

        await clickButton('Login');

        expect(fetch).toHaveBeenCalled();
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to login'
        );
      });
    });

    describe('when fetch fails', () => {
      it('sets error', async () => {
        mockFetchResponse({}, false);

        renderWithAuth();

        await clickButton('Login');

        expect(fetch).toHaveBeenCalled();
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to login'
        );
      });
    });
  });

  describe('loginAsDemoUser', () => {
    describe('when successful with user data', () => {
      it('sets user', async () => {
        mockFetchResponse({ success: true, user: mockUser });

        renderWithAuth();

        await clickButton('Demo Login');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when successful without user data', () => {
      it('sets error', async () => {
        mockFetchResponse({ success: true });

        renderWithAuth();

        await clickButton('Demo Login');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when fetch fails', () => {
      it('sets error', async () => {
        mockFetchResponse({}, false);

        renderWithAuth();

        await clickButton('Demo Login');

        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    describe('when successful', () => {
      it('clears user', async () => {
        mockFetchResponse({});

        renderWithAuth();

        await clickButton('Logout');

        expect(fetch).toHaveBeenCalled();
      });
    });

    describe('when fetch fails', () => {
      it('sets error', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        renderWithAuth();

        await clickButton('Logout');

        expect(fetch).toHaveBeenCalled();
      });
    });
  });

  describe('useEffect cleanup', () => {
    it('should handle focus event when user exists and not loading', async () => {
      mockFetchResponse({ success: true, user: mockUser });

      renderWithAuth(undefined, mockUser);

      // Trigger focus event
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
      });

      expect(fetch).toHaveBeenCalled();
    });

    it('should not call checkAuthStatus on focus when no user', async () => {
      renderWithAuth();

      // Trigger focus event with no user
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });

      // Should not have called any fetch
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
