import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminLayout from './AdminLayout';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUseAuth = jest.requireMock('@/contexts/AuthContext').useAuth;

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ isLoading: true });

    render(
      <AdminLayout>
        <div>Test content</div>
      </AdminLayout>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render children when auth is not loading', () => {
    mockUseAuth.mockReturnValue({ isLoading: false });

    render(
      <AdminLayout>
        <div data-testid='test-content'>Test content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
