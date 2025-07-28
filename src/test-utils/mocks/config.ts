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
  nodeEnv: 'test' as string,
  openai: {
    apiKey: 'mock-openai-key',
    model: 'gpt-4o-mini',
  },
};

export const mockAppConfigModule = () => {
  jest.mock('@/config/app', () => ({
    appConfig: mockAppConfig,
    __esModule: true,
  }));
};

// Function to update the mock config dynamically.
export const updateMockConfig = (updates: Partial<typeof mockAppConfig>) => {
  Object.assign(mockAppConfig, updates);
};

// Environment variable mocking utilities.
export const mockEnvironment = {
  development: () => {
    updateMockConfig({ nodeEnv: 'development' });
  },
  production: () => {
    updateMockConfig({ nodeEnv: 'production' });
  },
  test: () => {
    updateMockConfig({ nodeEnv: 'test' });
  },
  restore: (originalEnv: string | undefined) => {
    updateMockConfig({ nodeEnv: originalEnv });
  },
};
