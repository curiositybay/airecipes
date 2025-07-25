import { NextRequest } from 'next/server';

export const mockNextResponse = {
  json: jest.fn((data, opts) => ({
    json: () => Promise.resolve(data),
    status: opts?.status || 200,
    ...opts,
  })),
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
  return {
    nextUrl: { pathname: new URL(url).pathname },
    url,
    headers: new Map(Object.entries(headers)),
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
    NextRequest: jest.fn(),
    NextResponse: mockNextResponse,
  }));
};
