import { appConfig } from './app';

/**
 * Helper function to clear all required environment variables.
 */
function clearRequiredEnvVars() {
  delete process.env.NEXT_PUBLIC_APP_NAME;
  delete process.env.NEXT_PUBLIC_APP_VERSION;
  delete process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
  delete process.env.NEXT_PUBLIC_APP_DESCRIPTION;
  delete process.env.NEXT_PUBLIC_API_URL;
  delete process.env.NEXT_PUBLIC_APP_SLUG;
  delete process.env.NEXT_PUBLIC_APP_DOMAIN;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.NEXT_PUBLIC_GITHUB_REPO;
  delete process.env.NEXT_PUBLIC_APP_AUTHOR;
  delete process.env.NEXT_PUBLIC_APP_KEYWORDS;
  delete process.env.NEXT_PUBLIC_TWITTER_HANDLE;
  delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  delete process.env.NEXT_PUBLIC_404_MESSAGE;
  delete process.env.NEXT_PUBLIC_500_MESSAGE;
}

/**
 * Integration tests for the app config file.
 */
describe('appConfig Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when required environment variables are missing', async () => {
      // Clear all required environment variables
      clearRequiredEnvVars();

      // Reload the module to trigger validation
      jest.resetModules();

      await expect(import('./app')).rejects.toThrow(
        'Missing required environment variables'
      );
    });

    it('should handle partial missing environment variables', async () => {
      // Clear some required environment variables
      delete process.env.NEXT_PUBLIC_APP_NAME;
      delete process.env.NEXT_PUBLIC_APP_VERSION;

      // Reload the module to trigger validation
      jest.resetModules();

      await expect(import('./app')).rejects.toThrow(
        'Missing required environment variables'
      );
    });
  });

  describe('Server-Side Only Configurations (Client-Side)', () => {
    it('should provide undefined values when window is defined (client-side)', async () => {
      // Ensure client-side environment (window is defined)
      expect(typeof window).toBe('object');

      // Set server-side environment variables (should be ignored on client)
      process.env.AUTH_SERVICE_URL = 'https://auth.example.com';
      process.env.REDIS_URL = 'redis://localhost:6379';
      process.env.REDIS_PASSWORD = 'redis-password';
      process.env.OPENAI_API_KEY = 'sk-test-key';
      process.env.OPENAI_MODEL = 'gpt-4';

      // Reload the module to get updated config
      jest.resetModules();
      const { appConfig: clientConfig } = await import('./app');

      expect(clientConfig.authServiceUrl).toBeUndefined();
      expect(clientConfig.redis.url).toBeUndefined();
      expect(clientConfig.redis.password).toBeUndefined();
      expect(clientConfig.nodeEnv).toBeUndefined();
    });
  });
});
/**
 * Structure tests for the app config.
 *
 * These tests verify the config structure and types without testing
 * environment variable integration.
 */
describe('appConfig Structure Tests', () => {
  describe('Type exports', () => {
    it('should export AppConfig type', () => {
      // Type exports are checked at compile time, not runtime
      expect(appConfig).toBeDefined();
    });
  });

  describe('Configuration structure', () => {
    it('should have all required properties', () => {
      expect(appConfig).toHaveProperty('name');
      expect(appConfig).toHaveProperty('version');
      expect(appConfig).toHaveProperty('environment');
      expect(appConfig).toHaveProperty('description');
      expect(appConfig).toHaveProperty('apiUrl');
      expect(appConfig).toHaveProperty('domain');
      expect(appConfig).toHaveProperty('url');
      expect(appConfig).toHaveProperty('githubRepo');
      expect(appConfig).toHaveProperty('author');
      expect(appConfig).toHaveProperty('keywords');
      expect(appConfig).toHaveProperty('twitterHandle');
      expect(appConfig).toHaveProperty('contactEmail');
      expect(appConfig).toHaveProperty('errorMessages');
    });

    it('should have errorMessages with required properties', () => {
      expect(appConfig.errorMessages).toHaveProperty('notFound');
      expect(appConfig.errorMessages).toHaveProperty('serverError');
    });
  });
});
