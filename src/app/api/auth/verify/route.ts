import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the auth token from cookies or Authorization header
    const authToken =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    // Proxy the request to the auth-service
    const authServiceUrl = `${appConfig.authServiceUrl}/api/v1/auth/verify`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Also forward the cookie header as a fallback
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
    console.error('Verify proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
} 