export const mockGetCachedAuthResult = jest.fn();
export const mockCacheAuthResult = jest.fn();
export const mockExtractUserIdFromToken = jest.fn();
export const mockClearCache = jest.fn();

export const mockMiddlewareCacheModule = () => {
  jest.mock('@/lib/middleware-cache', () => ({
    __esModule: true,
    getCachedAuthResult: mockGetCachedAuthResult,
    cacheAuthResult: mockCacheAuthResult,
    extractUserIdFromToken: mockExtractUserIdFromToken,
    clearCache: mockClearCache,
  }));
};

export const setupMiddlewareCacheMocks = () => {
  mockMiddlewareCacheModule();
};
