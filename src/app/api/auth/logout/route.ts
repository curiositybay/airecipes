import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';
import logger from '@/lib/logger';
import {
  invalidateUserAuthCache,
  extractUserIdFromToken,
} from '@/lib/auth-cache';

export async function POST(request: NextRequest) {
  try {
    // Get auth token for cache invalidation.
    const authToken = request.cookies.get('auth_token')?.value;
    let userId: string | null = null;

    if (authToken) {
      userId = extractUserIdFromToken(authToken);
    }

    // Proxy the request to the auth-service.
    const authServiceUrl = `${appConfig.authServiceUrl}/api/v1/auth/logout`;

    const response = await fetch(authServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    const responseHeaders = new Headers();

    // Always clear the auth_token cookie by setting it to expire immediately.
    responseHeaders.set(
      'set-cookie',
      'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    );

    // Invalidate user's auth cache if we have user ID.
    if (userId) {
      try {
        await invalidateUserAuthCache(appConfig.appSlug, userId);
      } catch (cacheError) {
        let errorMessage: string;
        if (cacheError instanceof Error) {
          errorMessage = cacheError.message;
        } else {
          errorMessage = 'Unknown error';
        }

        logger.warn('Failed to invalidate auth cache on logout', {
          userId,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('Logout proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
