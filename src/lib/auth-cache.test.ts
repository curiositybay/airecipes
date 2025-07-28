import { mocks } from '@/test-utils/mocks';
import {
  hashToken,
  generateAuthCacheKey,
  cacheAuthResult,
  getCachedAuthResult,
  invalidateUserAuthCache,
  extractUserIdFromToken,
} from './auth-cache';
import { AuthUser } from '@/types/auth';

// Mock the redis module
jest.mock('./redis', () => ({
  setCacheValue: jest.fn(),
  getCacheValue: jest.fn(),
  deleteUserCacheEntries: jest.fn(),
}));

// Import mocked modules
import * as redisModule from './redis';

describe('auth-cache', () => {
  const mockUser: AuthUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    mocks.setup.all();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mocks.setup.clear();
  });

  describe('hashToken', () => {
    it('should handle empty token', () => {
      expect(hashToken('')).toBe('0');
    });
  });

  describe('generateAuthCacheKey', () => {
    it('should generate consistent cache key', () => {
      const key1 = generateAuthCacheKey('test-app', 'user123', 'abc123');
      const key2 = generateAuthCacheKey('test-app', 'user123', 'abc123');

      expect(key1).toBe(key2);
      expect(key1).toBe('auth:test-app:user123:abc123');
    });
  });

  describe('cacheAuthResult', () => {
    it('should handle different cache scenarios', async () => {
      // Success case
      (redisModule.setCacheValue as jest.Mock).mockResolvedValue(true);
      const successResult = await cacheAuthResult(
        'test-app',
        mockUser,
        'test-token',
        300
      );
      expect(successResult).toBe(true);
      expect(redisModule.setCacheValue).toHaveBeenCalledWith(
        expect.stringMatching(/^auth:test-app:user123:/),
        expect.objectContaining({
          user: mockUser,
          appSlug: 'test-app',
          expires: expect.any(Number),
          createdAt: expect.any(Number),
        }),
        300
      );

      // Failure case
      (redisModule.setCacheValue as jest.Mock).mockResolvedValue(false);
      const failureResult = await cacheAuthResult(
        'test-app',
        mockUser,
        'test-token'
      );
      expect(failureResult).toBe(false);

      // Error cases
      (redisModule.setCacheValue as jest.Mock).mockRejectedValue(
        new Error('Redis error')
      );
      const errorResult = await cacheAuthResult(
        'test-app',
        mockUser,
        'test-token'
      );
      expect(errorResult).toBe(false);

      (redisModule.setCacheValue as jest.Mock).mockRejectedValue(
        'String error'
      );
      const nonErrorResult = await cacheAuthResult(
        'test-app',
        mockUser,
        'test-token'
      );
      expect(nonErrorResult).toBe(false);
    });
  });

  describe('getCachedAuthResult', () => {
    const mockCachedResult = {
      user: { id: 'user123', email: 'test@example.com' },
      appSlug: 'test-app',
      tokenHash: 'abc123',
      expires: Date.now() + 300000,
      createdAt: Date.now(),
    };

    it('should handle different cache scenarios', async () => {
      // Valid cache
      const tokenHash = hashToken('test-token');
      const validResult = {
        ...mockCachedResult,
        tokenHash,
      };
      (redisModule.getCacheValue as jest.Mock).mockResolvedValue(validResult);
      const result = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(result).toEqual({ id: 'user123', email: 'test@example.com' });

      // Cache miss
      (redisModule.getCacheValue as jest.Mock).mockResolvedValue(null);
      const missResult = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(missResult).toBe(null);

      // Expired cache
      const expiredResult = { ...mockCachedResult, expires: Date.now() - 1000 };
      (redisModule.getCacheValue as jest.Mock).mockResolvedValue(expiredResult);
      const expiredCacheResult = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(expiredCacheResult).toBe(null);

      // App slug mismatch
      const mismatchedResult = {
        ...mockCachedResult,
        appSlug: 'different-app',
      };
      (redisModule.getCacheValue as jest.Mock).mockResolvedValue(
        mismatchedResult
      );
      const mismatchResult = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(mismatchResult).toBe(null);

      // Error cases
      (redisModule.getCacheValue as jest.Mock).mockRejectedValue(
        new Error('Redis error')
      );
      const errorResult = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(errorResult).toBe(null);

      (redisModule.getCacheValue as jest.Mock).mockRejectedValue(
        'String error'
      );
      const nonErrorResult = await getCachedAuthResult(
        'test-app',
        'user123',
        'test-token'
      );
      expect(nonErrorResult).toBe(null);
    });
  });

  describe('invalidateUserAuthCache', () => {
    it('should handle different invalidation scenarios', async () => {
      // Success case
      (redisModule.deleteUserCacheEntries as jest.Mock).mockResolvedValue(true);
      const successResult = await invalidateUserAuthCache(
        'test-app',
        'user123'
      );
      expect(successResult).toBe(true);
      expect(redisModule.deleteUserCacheEntries).toHaveBeenCalledWith(
        'test-app',
        'user123'
      );

      // Failure case
      (redisModule.deleteUserCacheEntries as jest.Mock).mockResolvedValue(
        false
      );
      const failureResult = await invalidateUserAuthCache(
        'test-app',
        'user123'
      );
      expect(failureResult).toBe(false);

      // Error cases
      (redisModule.deleteUserCacheEntries as jest.Mock).mockRejectedValue(
        new Error('Redis error')
      );
      const errorResult = await invalidateUserAuthCache('test-app', 'user123');
      expect(errorResult).toBe(false);

      (redisModule.deleteUserCacheEntries as jest.Mock).mockRejectedValue(
        'String error'
      );
      const nonErrorResult = await invalidateUserAuthCache(
        'test-app',
        'user123'
      );
      expect(nonErrorResult).toBe(false);
    });
  });

  describe('extractUserIdFromToken', () => {
    it('should handle different token scenarios', () => {
      // Invalid token format
      expect(extractUserIdFromToken('invalid-token')).toBe(null);

      // No user ID fields
      const payload = { email: 'test@example.com' };
      const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`;
      expect(extractUserIdFromToken(token)).toBe(null);

      // Malformed base64
      expect(extractUserIdFromToken('header.invalid-base64.signature')).toBe(
        null
      );

      // Non-Error exception
      const originalBufferFrom = Buffer.from;
      Buffer.from = jest.fn().mockImplementation(() => {
        throw 'String exception';
      });
      expect(extractUserIdFromToken('test.token.here')).toBe(null);
      Buffer.from = originalBufferFrom;
    });
  });
});
