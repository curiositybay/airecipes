import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { verifyAuth } from './auth';

export type UserRole = 'admin' | 'read-only';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export async function getCurrentUser(
  request?: Request
): Promise<AuthenticatedUser | null> {
  if (!request) {
    return null;
  }

  const authResult = await verifyAuth(request as unknown as NextRequest);

  if (!authResult.success || !authResult.user) {
    return null;
  }

  return {
    id: authResult.user.id,
    email: authResult.user.email,
    name: authResult.user.email,
    role: authResult.user.role,
  };
}

export async function requireAuth(
  request?: Request
): Promise<AuthenticatedUser> {
  if (!request) {
    redirect('/admin');
  }

  const user = await getCurrentUser(request);

  if (!user) {
    redirect('/admin');
  }

  return user;
}

export async function requireRole(): Promise<AuthenticatedUser> {
  throw new Error(
    'requireRole needs request context - implement in page components.'
  );
}

export async function requireAdminRole(): Promise<AuthenticatedUser> {
  return requireRole();
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions: Record<UserRole, string[]> = {
    admin: [
      'view_apps',
      'edit_apps',
      'delete_apps',
      'view_users',
      'edit_users',
      'delete_users',
      'view_configs',
      'edit_configs',
      'view_metrics',
      'edit_metrics',
    ],
    'read-only': ['view_apps', 'view_users', 'view_metrics'],
  };

  if (!rolePermissions[userRole]) {
    return false;
  }
  return rolePermissions[userRole].includes(permission);
}

export function isReadOnly(userRole: UserRole): boolean {
  return userRole === 'read-only';
}

export function canEditApps(userRole: UserRole): boolean {
  return hasPermission(userRole, 'edit_apps');
}

export function canDeleteApps(userRole: UserRole): boolean {
  return hasPermission(userRole, 'delete_apps');
}
