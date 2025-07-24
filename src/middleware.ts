import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';

// Middleware that protects admin routes and marks API calls for tracking
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mark API calls for tracking by adding a header
  if (pathname.startsWith('/api/')) {
    // Create a response that will be modified
    const response = NextResponse.next();

    // Add a header to indicate this is an API call that should be tracked
    response.headers.set('x-api-call-track', 'true');

    return response;
  }

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    // Check for auth token in cookies
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      // Redirect to login page if no auth token
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Verify the token with the auth service
    try {
      const verifyResponse = await fetch(
        `${appConfig.authServiceUrl}/api/v1/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ app_name: 'airecipes' }),
        }
      );

      if (!verifyResponse.ok) {
        // Token is invalid, redirect to login
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      const data = await verifyResponse.json();
      if (!data.success || !data.user) {
        // Token verification failed, redirect to login
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Token is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Auth verification error in middleware:', error);
      // On error, redirect to login for safety
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', // Protect all admin routes
    '/api/:path*', // Track API calls
  ],
};
