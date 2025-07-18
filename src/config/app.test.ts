import { appConfig, AppConfig } from './app';

describe('appConfig', () => {
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

  describe('App Information', () => {
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

      expect(appConfig.name).toBe('Web App Template');
      expect(appConfig.version).toBe('1.0.0');
      expect(appConfig.environment).toBe('development');
      expect(appConfig.description).toBe(
        'A modern full-stack web application template'
      );
    });
  });

  describe('API Configuration', () => {
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

      expect(appConfig.apiUrl).toBe('http://localhost:3000');
    });
  });

  describe('Domain and URLs', () => {
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

      expect(appConfig.domain).toBe('your-domain.com');
      expect(appConfig.url).toBe('https://your-domain.com');
      expect(appConfig.githubRepo).toBe(
        'https://github.com/your-repo/web-app-template'
      );
    });
  });

  describe('SEO and Social Media', () => {
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

      expect(appConfig.author).toBe('Your Name');
      expect(appConfig.keywords).toBe(
        'web development, React, Express, TypeScript, full-stack, template'
      );
      expect(appConfig.twitterHandle).toBe('@yourusername');
      expect(appConfig.contactEmail).toBe('your-email@example.com');
    });
  });

  describe('Error Messages', () => {
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

      expect(appConfig.errorMessages.notFound).toBe(
        "The page you're looking for doesn't exist."
      );
      expect(appConfig.errorMessages.serverError).toBe(
        'Something went wrong on our end. Please try again later.'
      );
    });
  });

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
