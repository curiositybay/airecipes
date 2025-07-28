/**
 * Mocks for Next.js app directory specific modules.
 */

export const mockUseRouter = jest.fn().mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
});

export const mockCookies = jest.fn().mockResolvedValue({
  get: jest.fn().mockReturnValue(undefined),
});
