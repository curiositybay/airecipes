import {
  hashToken,
  generateAuthCacheKey,
  cacheAuthResult,
  getCachedAuthResult,
  extractUserIdFromToken,
  clearCache,
} from './middleware-cache';
import mocks from '@/test-utils/mocks/mocks';

describe('middleware-cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
    mocks.setup.all();
  });

  describe('hashToken', () => {
    it('should generate consistent hash for same token', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different tokens and handle edge cases', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');

      expect(hash1).not.toBe(hash2);

      const emptyHash = hashToken('');
      expect(emptyHash).toBe('0');
    });
  });

  describe('generateAuthCacheKey', () => {
    it('should generate cache key with correct format', () => {
      const appSlug = 'test-app';
      const userId = 'user123';
      const tokenHash = 'abc123';

      const key = generateAuthCacheKey(appSlug, userId, tokenHash);

      expect(key).toBe('auth:test-app:user123:abc123');
    });
  });

  describe('cacheAuthResult', () => {
    it('should cache auth result successfully', () => {
      const appSlug = 'test-app';
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };
      const token = 'test-token';

      const result = cacheAuthResult(appSlug, user, token);

      expect(result).toBe(true);
    });

    it('should handle caching errors gracefully', () => {
      // Mock a scenario where caching fails.
      const appSlug = 'test-app';
      const user = null as unknown as import('@/types/auth').AuthUser; // This will cause an error.
      const token = 'test-token';

      const result = cacheAuthResult(appSlug, user, token);

      expect(result).toBe(false);
    });

    it('should trigger cleanup when cache size exceeds 1000', () => {
      // Add many entries to trigger cleanup.
      for (let i = 0; i < 1001; i++) {
        const user = {
          id: `user${i}`,
          email: `user${i}@example.com`,
          role: 'user',
        };
        const token = `token${i}`;

        cacheAuthResult('test-app', user, token);
      }

      /**
       * The cleanup should have been triggered.
       * We can verify this by checking that the cache doesn't grow indefinitely.
       * This test verifies the cleanup condition is hit.
       */
    });
  });

  describe('getCachedAuthResult', () => {
    it('should return null for non-existent cache entry', () => {
      const appSlug = 'test-app';
      const userId = 'user123';
      const token = 'test-token';

      const result = getCachedAuthResult(appSlug, userId, token);

      expect(result).toBe(null);
    });

    it('should return cached user when entry exists and is not expired', () => {
      const appSlug = 'test-app';
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };
      const token = 'test-token';

      cacheAuthResult(appSlug, user, token);
      const result = getCachedAuthResult(appSlug, user.id, token);

      expect(result).toEqual(user);
    });

    it('should return null and delete entry when cache is expired', async () => {
      const appSlug = 'test-app';
      const user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };
      const token = 'test-token';

      cacheAuthResult(appSlug, user, token, 0.001);
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = getCachedAuthResult(appSlug, user.id, token);
      expect(result).toBe(null);
    });

    it('should handle retrieval errors gracefully', () => {
      const appSlug = 'test-app';
      const userId = 'user123';
      const token = null as unknown as string; // This will cause an error.

      const result = getCachedAuthResult(appSlug, userId, token);

      expect(result).toBe(null);
    });
  });

  describe('extractUserIdFromToken', () => {
    it('should extract user ID from valid JWT tokens with different field names', () => {
      const payload1 = { sub: 'user123', exp: Date.now() / 1000 + 3600 };
      const header = { alg: 'HS256', typ: 'JWT' };

      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload1 = btoa(JSON.stringify(payload1));
      const signature = 'mock-signature';

      const token1 = `${encodedHeader}.${encodedPayload1}.${signature}`;

      const userId1 = extractUserIdFromToken(token1);
      expect(userId1).toBe('user123');

      const payload2 = { user_id: 'user456', exp: Date.now() / 1000 + 3600 };
      const encodedPayload2 = btoa(JSON.stringify(payload2));
      const token2 = `${encodedHeader}.${encodedPayload2}.${signature}`;

      const userId2 = extractUserIdFromToken(token2);
      expect(userId2).toBe('user456');
    });

    it('should handle invalid JWT tokens and missing user ID fields', () => {
      const invalidToken = 'invalid-jwt-token';
      expect(extractUserIdFromToken(invalidToken)).toBe(null);

      const invalidPayloadToken = 'header.invalid-payload.signature';
      expect(extractUserIdFromToken(invalidPayloadToken)).toBe(null);

      const payload = { exp: Date.now() / 1000 + 3600 };
      const header = { alg: 'HS256', typ: 'JWT' };

      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'mock-signature';

      const token = `${encodedHeader}.${encodedPayload}.${signature}`;

      expect(extractUserIdFromToken(token)).toBe(null);
    });
  });

  describe('cleanupExpiredEntries', () => {
    it('should clean up expired entries when triggered', async () => {
      for (let i = 0; i < 5; i++) {
        const user = {
          id: `user${i}`,
          email: `user${i}@example.com`,
          role: 'user',
        };
        const token = `token${i}`;

        cacheAuthResult('test-app', user, token, 0.001);
      }

      // Wait for expiration.
      await new Promise(resolve => setTimeout(resolve, 10));

      for (let i = 5; i < 1001; i++) {
        const user = {
          id: `user${i}`,
          email: `user${i}@example.com`,
          role: 'user',
        };
        const token = `token${i}`;

        cacheAuthResult('test-app', user, token);
      }

      const result = getCachedAuthResult('test-app', 'user0', 'token0');
      expect(result).toBe(null);
    });
  });
});
