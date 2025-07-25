import { appConfig, AppConfig } from './app';

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

  describe('Environment Variable Integration', () => {
    it('should use environment variables when provided', async () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'Test App';
      process.env.NEXT_PUBLIC_APP_VERSION = '2.0.0';
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_APP_DESCRIPTION = 'Test description';

      // Reload the module to get updated config
      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.name).toBe('Test App');
      expect(appConfig.version).toBe('2.0.0');
      expect(appConfig.environment).toBe('production');
      expect(appConfig.description).toBe('Test description');
    });

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
  });

  describe('API Configuration Integration', () => {
    it('should use environment variable for API URL when provided', async () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.apiUrl).toBe('https://api.example.com');
    });

    it('should use default API URL when environment variable is not provided', async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.apiUrl).toBeTruthy();
    });
  });

  describe('Domain and URLs Integration', () => {
    it('should use environment variables for domain and URLs when provided', async () => {
      process.env.NEXT_PUBLIC_APP_DOMAIN = 'example.com';
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
      process.env.NEXT_PUBLIC_GITHUB_REPO = 'https://github.com/test/repo';

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.domain).toBe('example.com');
      expect(appConfig.url).toBe('https://example.com');
      expect(appConfig.githubRepo).toBe('https://github.com/test/repo');
    });

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
    it('should use environment variables for SEO and social media when provided', async () => {
      process.env.NEXT_PUBLIC_APP_AUTHOR = 'John Doe';
      process.env.NEXT_PUBLIC_APP_KEYWORDS = 'test, keywords';
      process.env.NEXT_PUBLIC_TWITTER_HANDLE = '@johndoe';
      process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'john@example.com';

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.author).toBe('John Doe');
      expect(appConfig.keywords).toBe('test, keywords');
      expect(appConfig.twitterHandle).toBe('@johndoe');
      expect(appConfig.contactEmail).toBe('john@example.com');
    });

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
    it('should use environment variables for error messages when provided', async () => {
      process.env.NEXT_PUBLIC_404_MESSAGE = 'Custom 404 message';
      process.env.NEXT_PUBLIC_500_MESSAGE = 'Custom 500 message';

      jest.resetModules();
      const { appConfig } = await import('./app');

      expect(appConfig.errorMessages.notFound).toBe('Custom 404 message');
      expect(appConfig.errorMessages.serverError).toBe('Custom 500 message');
    });

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

    it('should have correct type structure', () => {
      // This test ensures the type is properly exported and can be used
      const config: AppConfig = appConfig;
      expect(config).toBeDefined();
      expect(typeof config.name).toBe('string');
      expect(typeof config.version).toBe('string');
      expect(typeof config.environment).toBe('string');
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
