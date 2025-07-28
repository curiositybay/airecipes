import { NextRequest } from 'next/server';
import { appConfig } from '@/config/app';

export type UserRole = 'admin' | 'read-only';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  app_name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Gets the auth service URL, ensuring it's available on server side
 */
function getAuthServiceUrl(): string {
  if (typeof window !== 'undefined') {
    throw new Error('Auth service URL is only available on server side');
  }

  if (!appConfig.authServiceUrl) {
    throw new Error('AUTH_SERVICE_URL environment variable is required');
  }

  return appConfig.authServiceUrl;
}

/**
 * Verifies user authentication by checking the session with the auth-service
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResponse> {
  try {
    // Get the auth token from cookies or Authorization header
    const authToken =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return {
        success: false,
        error: 'No authentication token provided',
      };
    }

    // Verify the token with the auth-service
    const authServiceUrl = `${getAuthServiceUrl()}/api/v1/auth/verify`;

    const response = await fetch(authServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ app_name: 'airecipes' }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Invalid or expired authentication token',
      };
    }

    const data = await response.json();

    if (!data.success || !data.user) {
      return {
        success: false,
        error: 'Authentication verification failed',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication service unavailable',
    };
  }
}

/**
 * Middleware function to protect API routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthResponse> {
  const authResult = await verifyAuth(request);

  if (!authResult.success) {
    throw new Error(authResult.error);
  }

  return authResult;
}

/**
 * Login as demo user automatically
 */
export async function loginAsDemoUser(): Promise<AuthResponse> {
  try {
    const authServiceUrl = `${getAuthServiceUrl()}/api/v1/auth/login`;

    const response = await fetch(authServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123',
        app_name: 'airecipes',
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Demo login failed',
      };
    }

    const data = await response.json();

    if (!data.success || !data.user) {
      return {
        success: false,
        error: 'Demo login failed',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Demo login error:', error);
    return {
      success: false,
      error: 'Demo login failed',
    };
  }
}
