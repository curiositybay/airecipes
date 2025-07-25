import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the auth token from cookies or Authorization header.
    const authToken =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    // Early return if no credentials are provided.
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'No authentication credentials provided' },
        { status: 401 }
      );
    }

    // Check if the token is expired by decoding it (JWT tokens contain expiration info).
    try {
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString()
        );
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          // Token is expired, return 401 immediately.
          return NextResponse.json(
            { success: false, error: 'Authentication token expired' },
            { status: 401 }
          );
        }
      }
    } catch {
      // If we can't decode the token, proceed with the auth service call.
      // The auth service will handle invalid token formats.
    }

    // Proxy the request to the auth-service.
    const authServiceUrl = `${appConfig.authServiceUrl}/api/v1/auth/verify`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header.
    headers['Authorization'] = `Bearer ${authToken}`;

    // Also forward the cookie header as a fallback.
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(authServiceUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    logger.error('Verify proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
