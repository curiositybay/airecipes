/**
 * @jest-environment node
 */

/**
 * Server-side only tests for the app config file.
 *
 * These tests verify that server-side only configurations work correctly
 * when running in a Node environment where window is undefined.
 */
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
});
