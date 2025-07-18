import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    try {
      const result = await rateLimit(ip);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests from this IP, please try again later.',
          },
          {
            status: 429,
            headers: result.headers as Record<string, string>,
          }
        );
      }

      const response = NextResponse.next();
      Object.entries(result.headers).forEach(([key, value]) => {
        if (value) {
          response.headers.set(key, value);
        }
      });

      return response;
    } catch (error) {
      // Handle rate limit errors gracefully
      console.error('Rate limit error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
