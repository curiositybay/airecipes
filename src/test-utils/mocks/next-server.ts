// Mock global Request and Response classes if not available (must be done before any imports).
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor() {}
  } as unknown as typeof Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor() {}
  } as unknown as typeof Response;
}

// Mock setImmediate if not available.
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((
    callback: (...args: unknown[]) => void,
    ...args: unknown[]
  ) => {
    return setTimeout(() => callback(...args), 0);
  }) as unknown as typeof setImmediate;
}

import { NextRequest } from 'next/server';

export const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options) => {
    const headers = new Headers();
    if (options?.headers) {
      // Handle both Headers object and plain object.
      if (options.headers instanceof Headers) {
        options.headers.forEach((value: string, key: string) => {
          headers.set(key, value);
        });
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
      }
    }
    return {
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      headers,
    };
  }),
  next: jest.fn(),
  redirect: jest.fn(),
};

export const mockNextRequest = {
  nextUrl: { pathname: '' },
  url: '',
  headers: new Map(),
  cookies: {
    get: jest.fn().mockReturnValue(null),
  },
};

export const createMockNextRequest = (
  url: string,
  headers: Record<string, string> = {},
  cookieValue: string | null = null
): NextRequest => {
  const headerMap = new Map(Object.entries(headers));

  // Add cookie header if cookieValue is provided.
  if (cookieValue) {
    headerMap.set('cookie', `auth_token=${cookieValue}`);
  }

  return {
    nextUrl: { pathname: new URL(url).pathname },
    url,
    headers: headerMap,
    cookies: {
      get: jest
        .fn()
        .mockReturnValue(cookieValue ? { value: cookieValue } : null),
    },
  } as unknown as NextRequest;
};

export const createMockNextResponse = () => ({
  headers: new Map(),
});

export const mockNextServerModule = () => {
  jest.mock('next/server', () => ({
    NextRequest: jest.fn().mockImplementation(() => ({
      cookies: {
        get: jest.fn(),
      },
      headers: {
        get: jest.fn(),
      },
    })),
    NextResponse: mockNextResponse,
  }));
};
