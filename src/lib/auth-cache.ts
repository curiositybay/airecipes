import logger from '@/lib/logger';
import { AuthUser, CachedAuthResult, isCachedAuthResult } from '@/types/auth';
import { getCacheValue, setCacheValue, deleteUserCacheEntries } from './redis';

/**
 * Generate a simple hash for the auth token.
 * Uses a simple string-based hash function that's compatible with Next.js edge runtime.
 */
export function hashToken(token: string): string {
  let hash = 0;
  if (token.length === 0) return hash.toString();

  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer.
  }

  return Math.abs(hash).toString(36);
}

// Generate cache key for auth result.
export function generateAuthCacheKey(
  appSlug: string,
  userId: string,
  tokenHash: string
): string {
  return `auth:${appSlug}:${userId}:${tokenHash}`;
}

// Cache auth result with configurable TTL.
export async function cacheAuthResult(
  appSlug: string,
  user: AuthUser,
  token: string,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const tokenHash = hashToken(token);
    const cacheKey = generateAuthCacheKey(appSlug, user.id, tokenHash);

    const cacheValue: CachedAuthResult = {
      user,
      appSlug,
      tokenHash,
      expires: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    };

    const success = await setCacheValue(cacheKey, cacheValue, ttlSeconds);

    if (success) {
      logger.info('Auth result cached', {
        appSlug,
        userId: user.id,
        cacheKey,
        ttlSeconds,
      });
    }

    return success;
  } catch (error) {
    logger.error('Failed to cache auth result', {
      appSlug,
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Retrieve cached auth result if valid and not expired.
export async function getCachedAuthResult(
  appSlug: string,
  userId: string,
  token: string
): Promise<AuthUser | null> {
  try {
    const tokenHash = hashToken(token);
    const cacheKey = generateAuthCacheKey(appSlug, userId, tokenHash);

    const cachedResult = await getCacheValue<CachedAuthResult>(cacheKey);

    if (!cachedResult || !isCachedAuthResult(cachedResult)) {
      return null;
    }

    // Check if cache entry is expired.
    if (Date.now() > cachedResult.expires) {
      logger.debug('Cached auth result expired', {
        appSlug,
        userId,
        cacheKey,
      });
      return null;
    }

    // Verify the cache entry matches our request.
    if (
      cachedResult.appSlug !== appSlug ||
      cachedResult.tokenHash !== tokenHash
    ) {
      logger.warn('Cached auth result mismatch', {
        appSlug,
        userId,
        cacheKey,
        expectedAppSlug: appSlug,
        cachedAppSlug: cachedResult.appSlug,
        expectedTokenHash: tokenHash,
        cachedTokenHash: cachedResult.tokenHash,
      });
      return null;
    }

    logger.info('Auth result retrieved from cache', {
      appSlug,
      userId,
      cacheKey,
      cacheAge: Date.now() - cachedResult.createdAt,
    });

    return cachedResult.user;
  } catch (error) {
    logger.error('Failed to get cached auth result', {
      appSlug,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// Invalidate all cached auth results for a user in this app.
export async function invalidateUserAuthCache(
  appSlug: string,
  userId: string
): Promise<boolean> {
  try {
    const success = await deleteUserCacheEntries(appSlug, userId);

    if (success) {
      logger.info('User auth cache invalidated', {
        appSlug,
        userId,
      });
    }

    return success;
  } catch (error) {
    logger.error('Failed to invalidate user auth cache', {
      appSlug,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Extract user ID from JWT token payload.
 * Used for cache key generation when user data is not yet available.
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

    return payload.sub || payload.user_id || payload.id || null;
  } catch (error) {
    logger.debug('Failed to extract user ID from token', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}
