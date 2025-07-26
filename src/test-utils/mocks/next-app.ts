import React from 'react';

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

export const mockNextLink = jest
  .fn()
  .mockImplementation(
    ({ href, children }: { href: string; children: React.ReactNode }) => {
      return React.createElement('a', { href }, children);
    }
  );

export const mockInterFont = jest.fn().mockReturnValue({
  className: 'mocked-inter-font',
});

export const setupNextAppMocks = () => {
  jest.mock('next/navigation', () => ({
    __esModule: true,
    useRouter: mockUseRouter,
  }));

  jest.mock('next/headers', () => ({
    __esModule: true,
    cookies: mockCookies,
  }));

  jest.mock('next/link', () => ({
    __esModule: true,
    default: mockNextLink,
  }));

  jest.mock('next/font/google', () => ({
    __esModule: true,
    Inter: mockInterFont,
  }));

  // Mock CSS imports.
  jest.mock('./globals.css', () => ({}));

  // Mock window.history for components that check browser history.
  Object.defineProperty(window, 'history', {
    value: {
      length: 2, // Simulates having history to go back to.
    },
    writable: true,
  });
};
