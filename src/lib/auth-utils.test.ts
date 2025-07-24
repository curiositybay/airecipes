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

  describe('getCurrentUser', () => {
    it('returns null when no request is provided', async () => {
      const result = await getCurrentUser();
      expect(result).toBeNull();
    });

    it('returns null when auth verification fails', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: false,
        user: undefined,
      });

      const request = {} as Request;
      const result = await getCurrentUser(request);

      expect(result).toBeNull();
      expect(mockVerifyAuth).toHaveBeenCalledWith(
        request as unknown as NextRequest
      );
    });

    it('returns user when auth verification succeeds', async () => {
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

      const request = {} as Request;
      const result = await getCurrentUser(request);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'test@example.com',
        role: 'admin',
      });
    });
  });

  describe('requireAuth', () => {
    it('redirects to admin when no request is provided', async () => {
      await requireAuth();
      expect(redirect).toHaveBeenCalledWith('/admin');
    });

    it('redirects to admin when user is not authenticated', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: false,
        user: undefined,
      });

      const request = {} as Request;
      await requireAuth(request);

      expect(redirect).toHaveBeenCalledWith('/admin');
    });

    it('returns user when authentication succeeds', async () => {
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

      const request = {} as Request;
      const result = await requireAuth(request);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'test@example.com',
        role: 'admin',
      });
    });
  });

  describe('requireRole', () => {
    it('throws error indicating it needs request context', async () => {
      await expect(requireRole()).rejects.toThrow(
        'requireRole needs request context - implement in page components.'
      );
    });
  });

  describe('requireAdminRole', () => {
    it('calls requireRole and throws the same error', async () => {
      await expect(requireAdminRole()).rejects.toThrow(
        'requireRole needs request context - implement in page components.'
      );
    });
  });

  describe('hasPermission', () => {
    it('returns true for admin with any permission', () => {
      expect(hasPermission('admin', 'view_apps')).toBe(true);
      expect(hasPermission('admin', 'edit_apps')).toBe(true);
      expect(hasPermission('admin', 'delete_apps')).toBe(true);
      expect(hasPermission('admin', 'view_users')).toBe(true);
      expect(hasPermission('admin', 'edit_users')).toBe(true);
      expect(hasPermission('admin', 'delete_users')).toBe(true);
      expect(hasPermission('admin', 'view_configs')).toBe(true);
      expect(hasPermission('admin', 'edit_configs')).toBe(true);
      expect(hasPermission('admin', 'view_metrics')).toBe(true);
      expect(hasPermission('admin', 'edit_metrics')).toBe(true);
    });

    it('returns true for read-only with view permissions', () => {
      expect(hasPermission('read-only', 'view_apps')).toBe(true);
      expect(hasPermission('read-only', 'view_users')).toBe(true);
      expect(hasPermission('read-only', 'view_metrics')).toBe(true);
    });

    it('returns false for read-only with edit permissions', () => {
      expect(hasPermission('read-only', 'edit_apps')).toBe(false);
      expect(hasPermission('read-only', 'delete_apps')).toBe(false);
      expect(hasPermission('read-only', 'edit_users')).toBe(false);
      expect(hasPermission('read-only', 'delete_users')).toBe(false);
      expect(hasPermission('read-only', 'edit_configs')).toBe(false);
      expect(hasPermission('read-only', 'edit_metrics')).toBe(false);
    });

    it('returns false for unknown permissions', () => {
      expect(hasPermission('admin', 'unknown_permission')).toBe(false);
      expect(hasPermission('read-only', 'unknown_permission')).toBe(false);
    });
  });

  describe('isReadOnly', () => {
    it('returns true for read-only role', () => {
      expect(isReadOnly('read-only')).toBe(true);
    });

    it('returns false for admin role', () => {
      expect(isReadOnly('admin')).toBe(false);
    });
  });

  describe('canEditApps', () => {
    it('returns true for admin role', () => {
      expect(canEditApps('admin')).toBe(true);
    });

    it('returns false for read-only role', () => {
      expect(canEditApps('read-only')).toBe(false);
    });
  });

  describe('canDeleteApps', () => {
    it('returns true for admin role', () => {
      expect(canDeleteApps('admin')).toBe(true);
    });

    it('returns false for read-only role', () => {
      expect(canDeleteApps('read-only')).toBe(false);
    });
  });
});
