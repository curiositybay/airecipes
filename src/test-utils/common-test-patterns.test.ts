import {
  createMockFetchResponse,
  createMockRequest,
  commonTestPatterns,
} from './common-test-patterns';

// Mock fetch globally
global.fetch = jest.fn();

describe('common-test-patterns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  describe('createMockRequest', () => {
    it('should create a mock request without body or headers', () => {
      const request = createMockRequest();

      expect(request).toBeDefined();
    });

    it('should create a mock request with body', () => {
      const body = { test: 'data' };
      const request = createMockRequest({ body });

      expect(request.json).toBeDefined();
    });

    it('should create a mock request with headers', () => {
      const headers = { Authorization: 'Bearer token' };
      const request = createMockRequest({ headers });

      expect(request.headers.get).toBeDefined();
      expect(request.headers.get('Authorization')).toBe('Bearer token');
    });
  });

  describe('commonTestPatterns', () => {
    it('should have testSuccess method', () => {
      expect(commonTestPatterns.testSuccess).toBeDefined();
      expect(typeof commonTestPatterns.testSuccess).toBe('function');
    });

    it('should have testError method', () => {
      expect(commonTestPatterns.testError).toBeDefined();
      expect(typeof commonTestPatterns.testError).toBe('function');
    });

    it('should have testError method', () => {
      expect(commonTestPatterns.testError).toBeDefined();
      expect(typeof commonTestPatterns.testError).toBe('function');
    });
  });
});
