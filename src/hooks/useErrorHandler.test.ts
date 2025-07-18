import { renderHook } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.setItem.mockClear();
    mockPush.mockClear();
  });

  it('returns all expected functions', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current).toHaveProperty('showErrorPage');
    expect(result.current).toHaveProperty('show404');
    expect(result.current).toHaveProperty('show500');
    expect(result.current).toHaveProperty('show403');
    expect(result.current).toHaveProperty('showCustomError');
  });

  describe('showErrorPage', () => {
    it('stores error info in sessionStorage and navigates to error page', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.showErrorPage(404, 'Test Error', 'Test message');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 404,
          title: 'Test Error',
          message: 'Test message',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });

    it('handles different error codes', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.showErrorPage(
        500,
        'Server Error',
        'Internal server error'
      );

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 500,
          title: 'Server Error',
          message: 'Internal server error',
        })
      );
    });
  });

  describe('show404', () => {
    it('calls showErrorPage with 404 error details', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.show404();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 404,
          title: 'Page Not Found',
          message: "The page you're looking for doesn't exist.",
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });
  });

  describe('show500', () => {
    it('calls showErrorPage with default 500 error message', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.show500();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 500,
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });

    it('calls showErrorPage with custom 500 error message', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.show500('Custom error message');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 500,
          title: 'Server Error',
          message: 'Custom error message',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });
  });

  describe('show403', () => {
    it('calls showErrorPage with 403 error details', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.show403();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 403,
          title: 'Access Denied',
          message: "You don't have permission to access this page.",
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });
  });

  describe('showCustomError', () => {
    it('calls showErrorPage with custom error details', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.showCustomError('Custom Title', 'Custom message');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'errorInfo',
        JSON.stringify({
          errorCode: 500,
          title: 'Custom Title',
          message: 'Custom message',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/error');
    });
  });

  it('handles multiple error calls correctly', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.show404();
    result.current.show500('Test error');

    expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledTimes(2);
  });
});
