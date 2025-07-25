export const mockAppConfig = {
  name: 'Mock App',
  version: '0.0.1',
  environment: 'test',
  description: 'Mock description',
  apiUrl: 'http://mock-api',
  authServiceUrl: 'http://mock-auth-service',
  appSlug: 'mock-app',
  domain: 'mock-domain.com',
  url: 'https://mock-domain.com',
  githubRepo: 'https://github.com/mock/repo',
  author: 'Mock Author',
  keywords: 'mock, test',
  twitterHandle: '@mock',
  contactEmail: 'mock@example.com',
  errorMessages: {
    notFound: 'Mock not found',
    serverError: 'Mock server error',
  },
  middleware: {
    apiCallTrackHeader: 'x-api-call-track',
  },
} as const;

export const mockAppConfigModule = () => {
  jest.mock('@/config/app', () => ({
    appConfig: mockAppConfig,
    __esModule: true,
  }));
};

// Environment variable mocking utilities.
export const mockEnvironment = {
  development: () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });
  },
  production: () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });
  },
  test: () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
    });
  },
  restore: (originalEnv: string | undefined) => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  },
};
