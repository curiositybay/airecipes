import { renderHook } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = jest.requireMock('next/navigation').useRouter;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('useErrorHandler', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  it('should show error page with custom error info', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.showErrorPage(400, 'Bad Request', 'Invalid input');

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  it('should show 404 error', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.show404();

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  it('should show 500 error with default message', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.show500();

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  it('should show 500 error with custom message', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.show500('Custom error message');

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  it('should show 403 error', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.show403();

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  it('should show custom error', () => {
    const { result } = renderHook(() => useErrorHandler());

    result.current.showCustomError('Custom Title', 'Custom message');

    expect(sessionStorageMock.setItem).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/error');
  });

  // it('should return all error handler methods', () => {
  //   const { result } = renderHook(() => useErrorHandler());

  //   expect(result.current).toHaveProperty('showErrorPage');
  //   expect(result.current).toHaveProperty('show404');
  //   expect(result.current).toHaveProperty('show500');
  //   expect(result.current).toHaveProperty('show403');
  //   expect(result.current).toHaveProperty('showCustomError');
  // });
});
