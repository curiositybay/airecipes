import { setupApiMocks, clearApiMocks } from '../test-utils/mocks';
import mockAxios from 'jest-mock-axios';

// Mock axios before importing the module
jest.mock('axios');

import api, { _requestSuccessHandler, _requestErrorHandler } from './api';

describe('api', () => {
  beforeEach(() => {
    setupApiMocks();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearApiMocks();
    mockAxios.reset();
  });

  describe('HTTP methods', () => {
    it('should perform a GET request with query params', async () => {
      const mockResponse = { data: { data: 'test', success: true } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await api.get('/test', { foo: 'bar', baz: 'qux' });

      expect(mockAxios.get).toHaveBeenCalledWith('/test', {
        params: { foo: 'bar', baz: 'qux' },
      });
      expect(result).toEqual({ data: 'test', success: true });
    });

    it('should perform a GET request without query params', async () => {
      const mockResponse = { data: { data: 'test', success: true } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await api.get('/test');

      expect(mockAxios.get).toHaveBeenCalledWith('/test', {
        params: {},
      });
      expect(result).toEqual({ data: 'test', success: true });
    });

    it('should perform a POST request with data', async () => {
      const mockResponse = { data: { data: 'created', success: true } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await api.post('/test', { foo: 'bar' });

      expect(mockAxios.post).toHaveBeenCalledWith('/test', {
        foo: 'bar',
      });
      expect(result).toEqual({ data: 'created', success: true });
    });

    it('should perform a POST request without data (using default)', async () => {
      const mockResponse = { data: { data: 'created', success: true } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await api.post('/test');

      expect(mockAxios.post).toHaveBeenCalledWith('/test', {});
      expect(result).toEqual({ data: 'created', success: true });
    });

    it('should perform a PUT request with data', async () => {
      const mockResponse = { data: { data: 'updated', success: true } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await api.put('/test', { foo: 'bar' });

      expect(mockAxios.put).toHaveBeenCalledWith('/test', {
        foo: 'bar',
      });
      expect(result).toEqual({ data: 'updated', success: true });
    });

    it('should perform a PUT request without data (using default)', async () => {
      const mockResponse = { data: { data: 'updated', success: true } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await api.put('/test');

      expect(mockAxios.put).toHaveBeenCalledWith('/test', {});
      expect(result).toEqual({ data: 'updated', success: true });
    });

    it('should perform a PATCH request with data', async () => {
      const mockResponse = { data: { data: 'patched', success: true } };
      mockAxios.patch.mockResolvedValue(mockResponse);

      const result = await api.patch('/test', { foo: 'bar' });

      expect(mockAxios.patch).toHaveBeenCalledWith('/test', {
        foo: 'bar',
      });
      expect(result).toEqual({ data: 'patched', success: true });
    });

    it('should perform a PATCH request without data (using default)', async () => {
      const mockResponse = { data: { data: 'patched', success: true } };
      mockAxios.patch.mockResolvedValue(mockResponse);

      const result = await api.patch('/test');

      expect(mockAxios.patch).toHaveBeenCalledWith('/test', {});
      expect(result).toEqual({ data: 'patched', success: true });
    });

    it('should perform a DELETE request', async () => {
      const mockResponse = { data: { data: 'deleted', success: true } };
      mockAxios.delete.mockResolvedValue(mockResponse);

      const result = await api.delete('/test');

      expect(mockAxios.delete).toHaveBeenCalledWith('/test');
      expect(result).toEqual({ data: 'deleted', success: true });
    });

    it('should handle empty query parameters in GET request', async () => {
      const mockResponse = { data: { data: 'test', success: true } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await api.get('/test', {
        empty: '',
        null: null as unknown as string,
        undefined: undefined as unknown as string,
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/test', {
        params: { empty: '', null: null, undefined: undefined },
      });
      expect(result).toEqual({ data: 'test', success: true });
    });

    it('should handle nested data in POST request', async () => {
      const nestedData = {
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'Anytown',
          },
        },
      };
      const mockResponse = { data: { data: 'nested', success: true } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await api.post('/test', nestedData);

      expect(mockAxios.post).toHaveBeenCalledWith('/test', nestedData);
      expect(result).toEqual({ data: 'nested', success: true });
    });
  });

  describe('Error handling', () => {
    describe('Server error responses (error.response exists)', () => {
      it('should handle server error with null data', async () => {
        const error = {
          response: {
            status: 403,
            data: null,
          },
        };
        mockAxios.get.mockRejectedValue(error);

        await expect(api.get('/test')).rejects.toThrow(/403/);
      });

      it('should handle error with response property that is falsy', async () => {
        const error = {
          response: null,
        };
        mockAxios.get.mockRejectedValue(error);

        // Refactored: check for error message containing 'unknown' (case-insensitive)
        await expect(api.get('/test')).rejects.toThrow(/unknown/i);
      });
    });

    describe('Network errors (error.request exists)', () => {
      it('should handle network error without message', async () => {
        const error = {
          request: {},
        };
        mockAxios.get.mockRejectedValue(error);

        await expect(api.get('/test')).rejects.toThrow(/Network error/);
      });
    });
  });
});

describe('_requestSuccessHandler', () => {
  it('logs method and url when config has method and url', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const config = { method: 'get', url: '/test' };
    const result = _requestSuccessHandler(config);
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/Making.*request/));
    expect(result).toBe(config);
    spy.mockRestore();
  });

  it('returns config unchanged if missing method or url', () => {
    const config = { foo: 'bar' };
    const result = _requestSuccessHandler(config);
    expect(result).toBe(config);
  });
});

describe('_requestErrorHandler', () => {
  it('logs error if error is an instance of Error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('fail');
    await expect(_requestErrorHandler(error)).rejects.toBe(error);
    expect(spy).toHaveBeenCalledWith('Request error:', error);
    spy.mockRestore();
  });

  it('logs error as string if error is not an instance of Error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = 'fail';
    await expect(_requestErrorHandler(error)).rejects.toBe(error);
    expect(spy).toHaveBeenCalledWith('Request error:', 'fail');
    spy.mockRestore();
  });
});
