import { AuthUser } from '@/types/auth';

interface CacheEntry {
  user: AuthUser;
  expires: number;
  createdAt: number;
}

/**
 * In-memory cache for middleware authentication results.
 * Cache is per-instance and cleared on server restart.
 */
const middlewareCache = new Map<string, CacheEntry>();

/**
 * Generate a simple hash for the auth token.
 * Uses a simple string-based hash function that's compatible with middleware edge runtime.
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

// Cache auth result in middleware memory with configurable TTL.
export function cacheAuthResult(
  appSlug: string,
  user: AuthUser,
  token: string,
  ttlSeconds: number = 300
): boolean {
  try {
    const tokenHash = hashToken(token);
    const cacheKey = generateAuthCacheKey(appSlug, user.id, tokenHash);

    const cacheEntry: CacheEntry = {
      user,
      expires: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    };

    middlewareCache.set(cacheKey, cacheEntry);

    // Clean up expired entries periodically.
    if (middlewareCache.size > 1000) {
      cleanupExpiredEntries();
    }

    return true;
  } catch (error) {
    console.error('Failed to cache auth result in middleware:', error);
    return false;
  }
}

// Retrieve cached auth result from middleware memory if valid and not expired.
export function getCachedAuthResult(
  appSlug: string,
  userId: string,
  token: string
): AuthUser | null {
  try {
    const tokenHash = hashToken(token);
    const cacheKey = generateAuthCacheKey(appSlug, userId, tokenHash);

    const cachedEntry = middlewareCache.get(cacheKey);

    if (!cachedEntry) {
      return null;
    }

    // Check if cache entry is expired.
    if (Date.now() > cachedEntry.expires) {
      middlewareCache.delete(cacheKey);
      return null;
    }

    return cachedEntry.user;
  } catch (error) {
    console.error('Failed to get cached auth result from middleware:', error);
    return null;
  }
}

// Remove expired cache entries to prevent memory leaks.
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of middlewareCache.entries()) {
    if (now > entry.expires) {
      middlewareCache.delete(key);
    }
  }
}

// Clear all cache entries for testing purposes.
export function clearCache(): void {
  middlewareCache.clear();
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

    const payload = JSON.parse(
      atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return payload.sub || payload.user_id || payload.id || null;
  } catch (error) {
    console.debug('Failed to extract user ID from token:', error);
    return null;
  }
}
