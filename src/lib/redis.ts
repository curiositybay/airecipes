import { createClient } from 'redis';
import { appConfig } from '@/config/app';
import logger from '@/lib/logger';

let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client.
export async function initRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  if (!appConfig.redis.url) {
    logger.warn('Redis URL not configured, caching will be disabled');
    return null;
  }

  try {
    redisClient = createClient({
      url: appConfig.redis.url,
      ...(appConfig.redis.password && { password: appConfig.redis.password }),
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis client disconnected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis client', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// Get Redis client instance.
export async function getRedisClient() {
  if (!redisClient) {
    return await initRedisClient();
  }
  return redisClient;
}

// Set cache value with TTL.
export async function setCacheValue(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Failed to set cache value', {
      key,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Get cache value.
export async function getCacheValue<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    logger.error('Failed to get cache value', {
      key,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

// Delete cache value.
export async function deleteCacheValue(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Failed to delete cache value', {
      key,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Delete all cache entries for a user in a specific app.
export async function deleteUserCacheEntries(
  appSlug: string,
  userId: string
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    const pattern = `auth:${appSlug}:${userId}:*`;
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(keys);
      logger.info('Deleted user cache entries', {
        appSlug,
        userId,
        count: keys.length,
      });
    }

    return true;
  } catch (error) {
    logger.error('Failed to delete user cache entries', {
      appSlug,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// Close Redis client connection.
export async function closeRedisClient() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis client connection closed');
    } catch (error) {
      logger.error('Failed to close Redis client', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Test Redis connection for monitoring.
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    // Simple ping test to verify connection.
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis connection test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
