import { NextRequest } from 'next/server';

export const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options) => {
    return {
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      headers: new Headers(),
    };
  }),
  next: jest.fn(),
  redirect: jest.fn(),
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
    NextResponse: mockNextResponse,
  }));
};
