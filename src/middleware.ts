import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';
import logger from '@/lib/middleware-logger';
import {
  AuthVerificationRequest,
  isAuthVerificationResponse,
  isAuthUser,
} from '@/types/auth';
import {
  getCachedAuthResult,
  cacheAuthResult,
  extractUserIdFromToken,
} from '@/lib/middleware-cache';

function redirectToAdmin(request: NextRequest) {
  return NextResponse.redirect(new URL('/admin', request.url));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set(appConfig.middleware.apiCallTrackHeader, 'true');
    return response;
  }

  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return redirectToAdmin(request);
    }

    // Try to get cached auth result first.
    const userId = extractUserIdFromToken(authToken);
    if (userId) {
      const cachedUser = await getCachedAuthResult(
        appConfig.appSlug,
        userId,
        authToken
      );

      if (cachedUser) {
        logger.info('Auth verification from cache', {
          pathname,
          userId: cachedUser.id,
          userEmail: cachedUser.email,
        });
        return NextResponse.next();
      }
    }

    // Cache miss - verify with auth service.
    try {
      const verifyResponse = await fetch(
        `${appConfig.authServiceUrl}/api/v1/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            app_name: appConfig.appSlug,
          } as AuthVerificationRequest),
        }
      );

      if (!verifyResponse.ok) {
        logger.warn('Auth verification failed', {
          pathname,
          status: verifyResponse.status,
        });
        return redirectToAdmin(request);
      }

      let data: unknown;
      try {
        data = await verifyResponse.json();
      } catch (parseError) {
        logger.error('Failed to parse auth verification response', {
          pathname,
          error:
            parseError instanceof Error
              ? parseError.message
              : 'Unknown parse error',
        });
        return redirectToAdmin(request);
      }

      if (!isAuthVerificationResponse(data)) {
        logger.error('Invalid auth verification response structure', {
          pathname,
          data: typeof data === 'object' ? JSON.stringify(data) : String(data),
        });
        return redirectToAdmin(request);
      }

      if (!data.success) {
        logger.warn('Auth verification returned success: false', {
          pathname,
          status: data.status,
          message: data.message,
        });
        return redirectToAdmin(request);
      }

      if (!data.user || !isAuthUser(data.user)) {
        logger.warn('Auth verification succeeded but no valid user data', {
          pathname,
          hasUser: !!data.user,
          userType: typeof data.user,
        });
        return redirectToAdmin(request);
      }

      // Cache the successful auth result.
      await cacheAuthResult(appConfig.appSlug, data.user, authToken);

      logger.info('Auth verification from service', {
        pathname,
        userId: data.user.id,
        userEmail: data.user.email,
        cached: true,
      });

      return NextResponse.next();
    } catch (error) {
      logger.error('Network error during auth verification', {
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return redirectToAdmin(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
