import { mocks } from '@/test-utils/mocks';

// Use Jest's automatic mock for redis (external library)
jest.mock('redis');

describe('redis', () => {
  let mockRedisClient: {
    on: jest.MockedFunction<
      (event: string, handler: (err: Error) => void) => void
    >;
    connect: jest.MockedFunction<() => Promise<void>>;
    setEx: jest.MockedFunction<
      (key: string, ttl: number, value: string) => Promise<void>
    >;
    get: jest.MockedFunction<(key: string) => Promise<string | null>>;
    del: jest.MockedFunction<(key: string | string[]) => Promise<number>>;
    keys: jest.MockedFunction<(pattern: string) => Promise<string[]>>;
    quit: jest.MockedFunction<() => Promise<void>>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Use selective setup for internal modules
    mocks.setup.all();

    // Update mock config for Redis
    mocks.mock.config.updateMockConfig({
      redis: {
        url: 'redis://localhost:6379',
        password: 'test-password',
      },
    });

    // Create mock Redis client
    mockRedisClient = {
      on: jest.fn(),
      connect: jest.fn(),
      setEx: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      quit: jest.fn(),
    };

    // Get the redis mock from Jest's automatic mock
    const redis = jest.requireMock('redis');
    redis.createClient.mockReturnValue(mockRedisClient);
  });

  // Helper function to mock Redis as unavailable
  const mockRedisUnavailable = () => {
    jest.doMock('@/config/app', () => ({
      appConfig: {
        redis: {
          url: '',
          password: '',
        },
      },
    }));
    jest.resetModules();
  };

  // Helper function to get and trigger event handlers
  const triggerEventHandler = (eventName: string) => {
    const handler = mockRedisClient.on.mock.calls.find(
      call => call[0] === eventName
    )?.[1];

    expect(handler).toBeDefined();
    if (handler) {
      handler(eventName === 'error' ? new Error('Redis error') : undefined);
    }
  };

  afterEach(() => {
    // Reset the module to clear the singleton
    jest.resetModules();
  });

  describe('initRedisClient', () => {
    it('should return existing client if already initialized', async () => {
      const { initRedisClient } = await import('./redis');

      // First call
      const result1 = await initRedisClient();
      // Second call
      const result2 = await initRedisClient();

      const redis = jest.requireMock('redis');
      expect(redis.createClient).toHaveBeenCalledTimes(1);
      expect(result1).toBe(mockRedisClient);
      expect(result2).toBe(mockRedisClient);
    });

    it('should handle Redis connection errors', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'));

      const { initRedisClient } = await import('./redis');

      const result = await initRedisClient();

      expect(result).toBeNull();
    });

    it('should handle non-Error connection failures', async () => {
      mockRedisClient.connect.mockRejectedValue('String error');

      const { initRedisClient } = await import('./redis');

      const result = await initRedisClient();

      expect(result).toBeNull();
    });

    it('should trigger event handlers when Redis events occur', async () => {
      const { initRedisClient } = await import('./redis');

      await initRedisClient();

      // Test all event handlers
      triggerEventHandler('error');
      triggerEventHandler('connect');
      triggerEventHandler('disconnect');
    });
  });

  describe('getRedisClient', () => {
    it('should return existing client if available', async () => {
      const { initRedisClient, getRedisClient } = await import('./redis');

      // Initialize first
      await initRedisClient();
      // Get client
      const result = await getRedisClient();

      expect(result).toBe(mockRedisClient);
    });
  });

  describe('setCacheValue', () => {
    it('should set cache value successfully', async () => {
      const { setCacheValue } = await import('./redis');

      const result = await setCacheValue('test-key', { data: 'test' }, 300);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'test-key',
        300,
        JSON.stringify({ data: 'test' })
      );
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisUnavailable();
      const { setCacheValue } = await import('./redis');

      const result = await setCacheValue('test-key', { data: 'test' });

      expect(result).toBe(false);
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      const { setCacheValue } = await import('./redis');

      const result = await setCacheValue('test-key', { data: 'test' });

      expect(result).toBe(false);
    });

    it('should handle non-Error Redis failures', async () => {
      mockRedisClient.setEx.mockRejectedValue('String error');

      const { setCacheValue } = await import('./redis');

      const result = await setCacheValue('test-key', { data: 'test' });

      expect(result).toBe(false);
    });
  });

  describe('getCacheValue', () => {
    it('should get cache value successfully', async () => {
      const testData = { data: 'test' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));

      const { getCacheValue } = await import('./redis');

      const result = await getCacheValue<typeof testData>('test-key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const { getCacheValue } = await import('./redis');

      const result = await getCacheValue('test-key');

      expect(result).toBeNull();
    });

    it('should return null when Redis client is not available', async () => {
      mockRedisUnavailable();
      const { getCacheValue } = await import('./redis');

      const result = await getCacheValue('test-key');

      expect(result).toBeNull();
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const { getCacheValue } = await import('./redis');

      const result = await getCacheValue('test-key');

      expect(result).toBeNull();
    });

    it('should handle non-Error Redis failures', async () => {
      mockRedisClient.get.mockRejectedValue('String error');

      const { getCacheValue } = await import('./redis');

      const result = await getCacheValue('test-key');

      expect(result).toBeNull();
    });
  });

  describe('deleteCacheValue', () => {
    it('should delete cache value successfully', async () => {
      const { deleteCacheValue } = await import('./redis');

      const result = await deleteCacheValue('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisUnavailable();
      const { deleteCacheValue } = await import('./redis');

      const result = await deleteCacheValue('test-key');

      expect(result).toBe(false);
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

      const { deleteCacheValue } = await import('./redis');

      const result = await deleteCacheValue('test-key');

      expect(result).toBe(false);
    });

    it('should handle non-Error Redis failures', async () => {
      mockRedisClient.del.mockRejectedValue('String error');

      const { deleteCacheValue } = await import('./redis');

      const result = await deleteCacheValue('test-key');

      expect(result).toBe(false);
    });
  });

  describe('deleteUserCacheEntries', () => {
    it('should delete user cache entries successfully', async () => {
      mockRedisClient.keys.mockResolvedValue(['key1', 'key2', 'key3']);

      const { deleteUserCacheEntries } = await import('./redis');

      const result = await deleteUserCacheEntries('test-app', 'user123');

      expect(mockRedisClient.keys).toHaveBeenCalledWith(
        'auth:test-app:user123:*'
      );
      expect(mockRedisClient.del).toHaveBeenCalledWith([
        'key1',
        'key2',
        'key3',
      ]);
      expect(result).toBe(true);
    });

    it('should handle case when no keys found', async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      const { deleteUserCacheEntries } = await import('./redis');

      const result = await deleteUserCacheEntries('test-app', 'user123');

      expect(mockRedisClient.del).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when Redis client is not available', async () => {
      mockRedisUnavailable();
      const { deleteUserCacheEntries } = await import('./redis');

      const result = await deleteUserCacheEntries('test-app', 'user123');

      expect(result).toBe(false);
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      const { deleteUserCacheEntries } = await import('./redis');

      const result = await deleteUserCacheEntries('test-app', 'user123');

      expect(result).toBe(false);
    });

    it('should handle non-Error Redis failures', async () => {
      mockRedisClient.keys.mockRejectedValue('String error');

      const { deleteUserCacheEntries } = await import('./redis');

      const result = await deleteUserCacheEntries('test-app', 'user123');

      expect(result).toBe(false);
    });
  });

  describe('closeRedisClient', () => {
    it('should close Redis client successfully', async () => {
      // First initialize the client
      const { initRedisClient, closeRedisClient } = await import('./redis');
      await initRedisClient();

      await closeRedisClient();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      // First initialize the client
      const { initRedisClient, closeRedisClient } = await import('./redis');
      await initRedisClient();

      mockRedisClient.quit.mockRejectedValue(new Error('Close error'));

      await closeRedisClient();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should handle non-Error close failures', async () => {
      // First initialize the client
      const { initRedisClient, closeRedisClient } = await import('./redis');
      await initRedisClient();

      mockRedisClient.quit.mockRejectedValue('String error');

      await closeRedisClient();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should do nothing when no client exists', async () => {
      const { closeRedisClient } = await import('./redis');

      await closeRedisClient();

      expect(mockRedisClient.quit).not.toHaveBeenCalled();
    });
  });
});
