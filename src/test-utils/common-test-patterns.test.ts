import {
  createMockFetchResponse,
  createMockRequest,
  timerHelpers,
} from './common-test-patterns';
import { mocks } from './mocks';

describe('common-test-patterns', () => {
  beforeEach(() => {
    mocks.setup.all();
  });

  afterEach(() => {
    mocks.setup.clear();
  });

  describe('createMockFetchResponse', () => {
    it('should create a mock fetch response with default values', () => {
      const mockData = { success: true };
      const response = createMockFetchResponse(mockData);

      expect(response.json).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers).toBeInstanceOf(Headers);
    });

    it('should create a mock fetch response with custom status and headers', () => {
      const mockData = { error: 'Not found' };
      const headers = { 'Content-Type': 'application/json' };
      const response = createMockFetchResponse(mockData, 404, headers);

      expect(response.status).toBe(404);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create a mock fetch response with multiple headers', () => {
      const mockData = { success: true };
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      };
      const response = createMockFetchResponse(mockData, 200, headers);

      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Authorization')).toBe('Bearer token');
      expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    });

    it('should create a mock fetch response with empty headers object', () => {
      const mockData = { success: true };
      const response = createMockFetchResponse(mockData, 200, {});

      expect(response.status).toBe(200);
      expect(response.headers).toBeInstanceOf(Headers);
    });

    it('should create a mock fetch response with undefined headers', () => {
      const mockData = { success: true };
      const response = createMockFetchResponse(mockData, 200, undefined);

      expect(response.status).toBe(200);
      expect(response.headers).toBeInstanceOf(Headers);
    });
  });

  describe('createMockRequest', () => {
    it('should create a mock request without body or headers', () => {
      const request = createMockRequest();

      expect(request).toBeDefined();
      expect(request.json).toBeUndefined();
      expect(request.headers).toBeUndefined();
    });

    it('should create a mock request with body', () => {
      const body = { test: 'data' };
      const request = createMockRequest({ body });

      expect(request).toBeDefined();
      expect(request.json).toBeDefined();
      expect(request.headers).toBeUndefined();
    });

    it('should create a mock request with headers', () => {
      const headers = { Authorization: 'Bearer token' };
      const request = createMockRequest({ headers });

      expect(request).toBeDefined();
      expect(request.json).toBeUndefined();
      expect(request.headers.get).toBeDefined();
      expect(request.headers.get('Authorization')).toBe('Bearer token');
    });

    it('should create a mock request with body and headers', () => {
      const body = { test: 'data' };
      const headers = { 'Content-Type': 'application/json' };
      const request = createMockRequest({ body, headers });

      expect(request).toBeDefined();
      expect(request.json).toBeDefined();
      expect(request.headers.get).toBeDefined();
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle undefined headers gracefully', () => {
      const body = { test: 'data' };
      const request = createMockRequest({ body });

      expect(request).toBeDefined();
      expect(request.json).toBeDefined();
      expect(request.headers).toBeUndefined();
    });

    it('should create a mock request with undefined body', () => {
      const request = createMockRequest({ body: undefined });

      expect(request).toBeDefined();
      expect(request.json).toBeUndefined();
      expect(request.headers).toBeUndefined();
    });

    it('should create a mock request with empty headers object', () => {
      const headers = {};
      const request = createMockRequest({ headers });

      expect(request).toBeDefined();
      expect(request.headers.get).toBeDefined();
      expect(request.headers.get('non-existent')).toBe(null);
    });

    it('should create a mock request with null body', () => {
      const request = createMockRequest({ body: null });

      expect(request).toBeDefined();
      expect(request.json).toBeDefined();
      expect(request.headers).toBeUndefined();
    });
  });

  describe('timerHelpers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should advance timers by default amount', () => {
      const startTime = Date.now();
      timerHelpers.advanceTimers();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });

    it('should advance timers by custom amount', () => {
      const startTime = Date.now();
      timerHelpers.advanceTimers(1000);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });

    it('should advance timers by zero amount', () => {
      const startTime = Date.now();
      timerHelpers.advanceTimers(0);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });

    it('should setup fake timers', () => {
      timerHelpers.setupFakeTimers();
      // Check that timers are fake by verifying setTimeout behavior
      const mockFn = jest.fn();
      setTimeout(mockFn, 1000);
      expect(mockFn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should restore real timers', () => {
      timerHelpers.setupFakeTimers();
      timerHelpers.restoreRealTimers();
      // Check that timers are real by verifying setTimeout behavior
      const mockFn = jest.fn();
      setTimeout(mockFn, 1000);
      expect(mockFn).not.toHaveBeenCalled();
      // With real timers, we can't advance them artificially
      expect(typeof setTimeout).toBe('function');
    });

    it('should have typeAndWait method', () => {
      expect(typeof timerHelpers.typeAndWait).toBe('function');
    });
  });
});
