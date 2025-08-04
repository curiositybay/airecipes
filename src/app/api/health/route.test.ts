import mocks from '../../../test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Mock process.uptime using the mock architecture.
jest.spyOn(process, 'uptime').mockReturnValue(mocks.mock.process.uptime());

// Mock the Redis module before any imports
jest.doMock('@/lib/redis', () => ({
  testRedisConnection: jest.fn().mockResolvedValue(false),
}));

describe('api/health/route', () => {
  let GET: () => Promise<Response>;
  let testRedisConnection: jest.MockedFunction<() => Promise<boolean>>;

  // Shared setup function
  const setupTest = async () => {
    jest.resetModules();
    mocks.setup.all();

    // Get the mocked Redis function
    const redisModule = await import('@/lib/redis');
    testRedisConnection = jest.mocked(redisModule.testRedisConnection);

    // Import the route after mocks
    ({ GET } = jest.requireActual('./route'));
  };

  const cleanupTest = () => {
    mocks.setup.clear();
    jest.clearAllMocks();
  };

  // Helper functions for common test scenarios
  const mockAllChecksPass = async () => {
    mocks.mock.prisma.client.$queryRaw.mockResolvedValue([{ '1': 1 }]);
    testRedisConnection.mockResolvedValue(true);
    mocks.mock.http.fetchSuccess({ ok: true, status: 200 });
  };

  const mockDatabaseFailure = () => {
    mocks.mock.prisma.client.$queryRaw.mockRejectedValue(
      new Error('Database error')
    );
  };

  const mockRedisFailure = () => {
    testRedisConnection.mockRejectedValue(new Error('Redis connection error'));
  };

  const mockAuthServiceFailure = () => {
    mocks.mock.http.fetchSuccess({ ok: false, status: 500 });
  };

  const mockAuthServiceNotConfigured = () => {
    mocks.mock.config.app.authServiceUrl = '';
  };

  beforeEach(async () => {
    await setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Health check scenarios', () => {
    it('returns healthy status when all checks pass', async () => {
      await mockAllChecksPass();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      expect(data.responseTime).toBeDefined();
      expect(data.checks).toEqual({
        database: true,
        redis: true,
        authService: true,
      });
    });

    it('returns degraded status when database check fails', async () => {
      mockDatabaseFailure();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('degraded');
      expect(data.timestamp).toBeDefined();
      expect(data.responseTime).toBeDefined();
      expect(data.checks).toEqual({
        database: false,
        redis: false,
        authService: false,
      });
    });
  });

  describe('Individual health check failures', () => {
    it('handles auth service failure response', async () => {
      mockAuthServiceFailure();

      const response = await GET();
      const data = await response.json();

      expect(data.checks.authService).toBe(false);
    });

    it('handles auth service not configured', async () => {
      mockAuthServiceNotConfigured();

      const response = await GET();
      const data = await response.json();

      expect(data.checks.authService).toBe(true);
    });

    it('handles database success when previous state was already true (false condition)', async () => {
      // First call - database succeeds, previousHealthStates.database gets set to true
      await mockAllChecksPass();
      await GET();

      // Second call - database still succeeds, but previousHealthStates.database is already true
      // This should trigger the false condition: previousHealthStates.database !== true
      // Since previousHealthStates.database is already true, the condition should be false
      const response = await GET();
      const data = await response.json();

      expect(data.checks.database).toBe(true);
    });

    it('handles database failure when previous state was already false (false condition)', async () => {
      // First call - database fails, previousHealthStates.database gets set to false
      mockDatabaseFailure();
      await GET();

      // Second call - database still fails, but previousHealthStates.database is already false
      // This should trigger the false condition: previousHealthStates.database !== false
      // Since previousHealthStates.database is already false, the condition should be false
      const response = await GET();
      const data = await response.json();

      expect(data.checks.database).toBe(false);
    });

    it('handles Redis failure when previous state was already false (false condition)', async () => {
      // First call - Redis fails, previousHealthStates.redis gets set to false
      mockRedisFailure();
      await GET();

      // Second call - Redis still fails, but previousHealthStates.redis is already false
      // This should trigger the false condition: previousHealthStates.redis !== false
      // Since previousHealthStates.redis is already false, the condition should be false
      const response = await GET();
      const data = await response.json();

      expect(data.checks.redis).toBe(false);
    });

    it('handles error status when previous status was already error (false condition)', async () => {
      const originalUptime = process.uptime;
      process.uptime = jest.fn().mockImplementation(() => {
        throw new Error('Uptime error');
      });

      try {
        // First call - triggers error, lastHealthStatus gets set to 503
        await GET();

        // Second call - still triggers error, but lastHealthStatus is already 503
        // This should trigger the false condition: lastHealthStatus !== errorStatusCode
        // Since lastHealthStatus is already 503, the condition should be false
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.error).toBe('Health check failed');
      } finally {
        process.uptime = originalUptime;
      }
    });
  });
});
