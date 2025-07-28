import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { verifyAuth } from './auth';
import {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdminRole,
  hasPermission,
  isReadOnly,
  canEditApps,
  canDeleteApps,
  type UserRole,
} from './auth-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock auth module
jest.mock('./auth', () => ({
  verifyAuth: jest.fn(),
}));

describe('auth-utils', () => {
  const mockVerifyAuth = verifyAuth as jest.MockedFunction<typeof verifyAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication functions', () => {
    it('should handle different authentication scenarios', async () => {
      // getCurrentUser - auth verification fails
      mockVerifyAuth.mockResolvedValue({
        success: false,
        user: undefined,
      });
      const request = {} as Request;
      const currentUserResult = await getCurrentUser(request);
      expect(currentUserResult).toBeNull();
      expect(mockVerifyAuth).toHaveBeenCalledWith(
        request as unknown as NextRequest
      );

      // requireAuth - no request provided
      await requireAuth();
      expect(redirect).toHaveBeenCalledWith('/admin');

      // requireAuth - authentication succeeds
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin' as UserRole,
        app_name: 'airecipes',
      };
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: mockUser,
      });
      const authResult = await requireAuth(request);
      expect(authResult).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'test@example.com',
        role: 'admin',
      });
    });
  });

  describe('role functions', () => {
    it('should handle role requirement scenarios', async () => {
      // requireRole throws error
      await expect(requireRole()).rejects.toThrow(
        'requireRole needs request context - implement in page components.'
      );

      // requireAdminRole throws same error
      await expect(requireAdminRole()).rejects.toThrow(
        'requireRole needs request context - implement in page components.'
      );
    });
  });

  describe('permission functions', () => {
    it('should handle different permission scenarios', () => {
      // hasPermission - unknown role
      expect(hasPermission('unknown-role' as UserRole, 'view_apps')).toBe(
        false
      );

      // isReadOnly - read-only role
      expect(isReadOnly('read-only')).toBe(true);

      // canEditApps - admin role
      expect(canEditApps('admin')).toBe(true);

      // canDeleteApps - admin role
      expect(canDeleteApps('admin')).toBe(true);
    });
  });
});
