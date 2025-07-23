import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy the request to the auth-service
    const authServiceUrl = `${appConfig.authServiceUrl}/api/v1/auth/login`;

    const response = await fetch(authServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const responseHeaders = new Headers();

    // Copy cookies from auth-service response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('set-cookie', setCookieHeader);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
} 