/**
 * @jest-environment node
 */

/**
 * Server-side only tests for the app config file.
 *
 * These tests verify that server-side only configurations work correctly
 * when running in a Node environment where window is undefined.
 */

/**
 * Helper function to clear server environment variables.
 */
function clearServerEnvVars() {
  delete process.env.AUTH_SERVICE_URL;
  delete process.env.REDIS_URL;
  delete process.env.OPENAI_API_KEY;
}

describe('appConfig Server-Side Only Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use default model when OPENAI_MODEL is not set', async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    delete process.env.OPENAI_MODEL;

    const { appConfig } = await import('./app');

    expect(appConfig.openai.apiKey).toBe('test-api-key');
    expect(appConfig.openai.model).toBe('gpt-4o-mini'); // Default value
  });

  it('should handle missing server-side environment variables gracefully', async () => {
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.REDIS_URL;
    delete process.env.REDIS_PASSWORD;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;

    const { appConfig } = await import('./app');

    expect(appConfig.authServiceUrl).toBeUndefined();
    expect(appConfig.redis.url).toBeUndefined();
    expect(appConfig.redis.password).toBeUndefined();
    expect(appConfig.openai.apiKey).toBeUndefined();
    expect(appConfig.openai.model).toBe('gpt-4o-mini'); // Still uses default
  });

  describe('Server Environment Variable Validation', () => {
    it('should throw error when server environment variables are missing in production', async () => {
      // Set NODE_ENV to production and clear server environment variables
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      clearServerEnvVars();

      // Clear module cache and reload the module to trigger validation
      jest.resetModules();
      jest.clearAllMocks();

      // Force a fresh import that will trigger the validation
      const modulePath = require.resolve('./app');
      delete require.cache[modulePath];

      await expect(import('./app')).rejects.toThrow(
        'Missing required server environment variables'
      );
    });

    it('should not throw error when server environment variables are missing in non-production', async () => {
      // Set NODE_ENV to test and clear server environment variables
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
        configurable: true,
      });
      clearServerEnvVars();

      // Clear module cache and reload the module to trigger validation
      jest.resetModules();
      jest.clearAllMocks();

      // Force a fresh import that will trigger the validation
      const modulePath = require.resolve('./app');
      delete require.cache[modulePath];

      // Should not throw error in non-production environment
      await expect(import('./app')).resolves.toBeDefined();
    });
  });
});
