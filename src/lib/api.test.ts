import api, { _requestSuccessHandler, _requestErrorHandler } from './api';
import mockAxios from 'jest-mock-axios';

// Mock axios before importing the module
jest.mock('axios');

describe('api', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('HTTP methods', () => {
    it('should perform HTTP requests with correct parameters', async () => {
      const mockResponse = { data: { data: 'test', success: true } };

      // Test GET with params
      mockAxios.get.mockResolvedValue(mockResponse);
      const getResult = await api.get('/test', { foo: 'bar' });
      expect(mockAxios.get).toHaveBeenCalledWith('/test', {
        params: { foo: 'bar' },
      });
      expect(getResult).toEqual({ data: 'test', success: true });

      // Test POST with default data
      mockAxios.post.mockResolvedValue(mockResponse);
      const postResult = await api.post('/test');
      expect(mockAxios.post).toHaveBeenCalledWith('/test', {});
      expect(postResult).toEqual({ data: 'test', success: true });

      // Test PUT with default data
      mockAxios.put.mockResolvedValue(mockResponse);
      const putResult = await api.put('/test');
      expect(mockAxios.put).toHaveBeenCalledWith('/test', {});
      expect(putResult).toEqual({ data: 'test', success: true });

      // Test PATCH with default data
      mockAxios.patch.mockResolvedValue(mockResponse);
      const patchResult = await api.patch('/test');
      expect(mockAxios.patch).toHaveBeenCalledWith('/test', {});
      expect(patchResult).toEqual({ data: 'test', success: true });

      // Test DELETE
      mockAxios.delete.mockResolvedValue(mockResponse);
      const deleteResult = await api.delete('/test');
      expect(mockAxios.delete).toHaveBeenCalledWith('/test');
      expect(deleteResult).toEqual({ data: 'test', success: true });
    });
  });

  describe('Error handling', () => {
    it('should handle different error types', async () => {
      // Server error with null data
      const serverError = {
        response: {
          status: 403,
          data: null,
        },
      };
      mockAxios.get.mockRejectedValue(serverError);
      await expect(api.get('/test')).rejects.toThrow(/403/);

      // Error with falsy response
      const falsyResponseError = {
        response: null,
      };
      mockAxios.get.mockRejectedValue(falsyResponseError);
      await expect(api.get('/test')).rejects.toThrow(/unknown/i);

      // Network error
      const networkError = {
        request: {},
      };
      mockAxios.get.mockRejectedValue(networkError);
      await expect(api.get('/test')).rejects.toThrow(/Network error/);
    });
  });

  describe('Request interceptors', () => {
    it('should handle request success handler', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Valid config
      const validConfig = { method: 'get', url: '/test' };
      const result1 = _requestSuccessHandler(validConfig);
      expect(result1).toBe(validConfig);
      expect(consoleSpy).toHaveBeenCalled();

      // Invalid config
      const invalidConfig = 'invalid config';
      const result2 = _requestSuccessHandler(invalidConfig);
      expect(result2).toBe(invalidConfig);
      expect(consoleSpy).toHaveBeenCalledTimes(1); // Only called once for valid config

      consoleSpy.mockRestore();
    });

    it('should handle request error handler', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Error instance
      const errorInstance = new Error('Test error');
      const result1 = _requestErrorHandler(errorInstance);
      await expect(result1).rejects.toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith('Request error:', errorInstance);

      // Non-Error instance
      const stringError = 'String error';
      const result2 = _requestErrorHandler(stringError);
      await expect(result2).rejects.toBe('String error');
      expect(consoleSpy).toHaveBeenCalledWith('Request error:', 'String error');

      consoleSpy.mockRestore();
    });
  });
});
