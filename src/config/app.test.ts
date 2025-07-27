import { appConfig } from './app';

/**
 * Integration tests for the app config file.
 *
 * These tests verify that the config file properly reads environment variables
 * and provides appropriate defaults. Since this is testing the config file itself
 * (which is allowed to use process.env), we test the actual integration.
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
      expect(clientConfig.openai.apiKey).toBeUndefined();
      expect(clientConfig.openai.model).toBeUndefined();
    });
  });

  describe('Environment Variable Integration', () => {
    it('should use default values when environment variables are not provided', async () => {
      // Clear environment variables
      delete process.env.NEXT_PUBLIC_APP_NAME;
      delete process.env.NEXT_PUBLIC_APP_VERSION;
      delete process.env.NEXT_PUBLIC_APP_ENVIRONMENT;
      delete process.env.NEXT_PUBLIC_APP_DESCRIPTION;

      // Reload the module to get updated config
      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.name).toBeTruthy();
      expect(appConfig.version).toBeTruthy();
      expect(appConfig.environment).toBeTruthy();
      expect(appConfig.description).toBeTruthy();
    });

    it('should use fallback when appSlug environment variable is falsy', async () => {
      // Set appSlug to falsy values to test fallback
      process.env.NEXT_PUBLIC_APP_SLUG = '';

      // Reload the module to get updated config
      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.appSlug).toBe('airecipes');

      // Test with undefined
      delete process.env.NEXT_PUBLIC_APP_SLUG;

      // Reload the module to get updated config
      jest.resetModules();
      const { appConfig: config2 } = await import('./app');

      expect(config2.appSlug).toBe('airecipes');
    });
  });

  describe('API Configuration Integration', () => {
    it('should use default API URL when environment variable is not provided', async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.apiUrl).toBeTruthy();
    });
  });

  describe('Domain and URLs Integration', () => {
    it('should use default values for domain and URLs when environment variables are not provided', async () => {
      delete process.env.NEXT_PUBLIC_APP_DOMAIN;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_GITHUB_REPO;

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.domain).toBeTruthy();
      expect(appConfig.url).toBeTruthy();
      expect(appConfig.githubRepo).toBeTruthy();
    });
  });

  describe('SEO and Social Media Integration', () => {
    it('should use default values for SEO and social media when environment variables are not provided', async () => {
      delete process.env.NEXT_PUBLIC_APP_AUTHOR;
      delete process.env.NEXT_PUBLIC_APP_KEYWORDS;
      delete process.env.NEXT_PUBLIC_TWITTER_HANDLE;
      delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.author).toBeTruthy();
      expect(appConfig.keywords).toBeTruthy();
      expect(appConfig.twitterHandle).toBeTruthy();
      expect(appConfig.contactEmail).toBeTruthy();
    });
  });

  describe('Error Messages Integration', () => {
    it('should use default values for error messages when environment variables are not provided', async () => {
      delete process.env.NEXT_PUBLIC_404_MESSAGE;
      delete process.env.NEXT_PUBLIC_500_MESSAGE;

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.errorMessages.notFound).toBeTruthy();
      expect(appConfig.errorMessages.serverError).toBeTruthy();
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
