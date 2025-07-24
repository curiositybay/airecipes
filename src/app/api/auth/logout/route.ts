import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';

export async function POST(request: NextRequest) {
  try {
    // Proxy the request to the auth-service
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

    // Always clear the auth_token cookie by setting it to expire immediately
    responseHeaders.set(
      'set-cookie',
      'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    );

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
