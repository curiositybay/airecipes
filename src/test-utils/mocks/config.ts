export const mockAppConfig = {
  name: 'Mock App',
  version: '0.0.1',
  environment: 'test',
  description: 'Mock description',
  apiUrl: 'http://mock-api',
  authServiceUrl: 'http://mock-auth-service',
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
} as const;

export const mockAppConfigModule = () => {
  jest.mock('@/config/app', () => ({
    appConfig: mockAppConfig,
    __esModule: true,
  }));
};
