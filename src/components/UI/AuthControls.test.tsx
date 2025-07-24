import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthControls from './AuthControls';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = jest.requireMock('@/contexts/AuthContext').useAuth;

describe('AuthControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login button when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loginAsDemoUser: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthControls />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render user email and logout button when user is logged in', () => {
    const mockUser = {
      email: 'test@example.com',
      id: '1',
      role: 'read-only' as const,
      app_name: 'airecipes',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loginAsDemoUser: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthControls />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should call loginAsDemoUser when login button is clicked', async () => {
    const mockLoginAsDemoUser = jest.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      loginAsDemoUser: mockLoginAsDemoUser,
      logout: jest.fn(),
    });

    render(<AuthControls />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLoginAsDemoUser).toHaveBeenCalledTimes(1);
    });
  });

  it('should call logout when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    const mockUser = {
      email: 'test@example.com',
      id: '1',
      role: 'read-only' as const,
      app_name: 'airecipes',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loginAsDemoUser: jest.fn(),
      logout: mockLogout,
    });

    render(<AuthControls />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle logout error gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
    const mockUser = {
      email: 'test@example.com',
      id: '1',
      role: 'read-only' as const,
      app_name: 'airecipes',
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loginAsDemoUser: jest.fn(),
      logout: mockLogout,
    });

    render(<AuthControls />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Logout error:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
