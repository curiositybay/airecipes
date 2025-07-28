import { NextRequest } from 'next/server';
import { act } from '@testing-library/react';
import { typeAndWait } from './testing-library-helpers';

// Common test patterns and utilities for API route testing.

export interface MockFetchResponse {
  json: jest.Mock;
  status: number;
  headers: Headers;
}

export interface MockRequestConfig {
  body?: unknown;
  headers?: Record<string, string>;
}

// Timer helper functions for frontend component testing.
export const timerHelpers = {
  // Advances timers by the specified milliseconds.
  advanceTimers: (ms: number = 500) => {
    act(() => jest.advanceTimersByTime(ms));
  },

  // Types into an input and waits for the value to appear in the document.
  typeAndWait,

  // Sets up fake timers for a test.
  setupFakeTimers: () => {
    jest.useFakeTimers();
  },

  // Restores real timers after a test.
  restoreRealTimers: () => {
    jest.useRealTimers();
  },
};

// Creates a mock fetch response.
export function createMockFetchResponse(
  data: unknown,
  status: number = 200,
  headers?: Record<string, string>
): MockFetchResponse {
  const mockHeaders = new Headers();
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      mockHeaders.set(key, value);
    });
  }

  return {
    json: jest.fn().mockResolvedValue(data),
    status,
    headers: mockHeaders,
  };
}

// Creates a mock NextRequest.
export function createMockRequest(config: MockRequestConfig = {}): NextRequest {
  const request: Record<string, unknown> = {};

  if (config.body !== undefined) {
    request.json = jest.fn().mockResolvedValue(config.body);
  }

  if (config.headers) {
    request.headers = {
      get: jest.fn((key: string) => config.headers![key] || null),
    };
  }

  return request as unknown as NextRequest;
}
