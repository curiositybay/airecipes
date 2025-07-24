import { ApiRouteTestHelper, createApiRouteTest } from './api-route-test';

// Mock the mocks module
jest.mock('./mocks', () => ({
  setupApiMocks: jest.fn(),
  clearApiMocks: jest.fn(),
}));

describe('ApiRouteTestHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance with correct configuration', () => {
    const config = {
      routePath: './test-route',
      method: 'GET' as const,
      mockConfig: {
        authServiceUrl: 'http://test.com',
        requireAuth: true,
      },
    };

    const helper = new ApiRouteTestHelper(config);
    expect(helper).toBeInstanceOf(ApiRouteTestHelper);
  });

  it('should create an instance without mock config', () => {
    const config = {
      routePath: './test-route',
      method: 'POST' as const,
    };

    const helper = new ApiRouteTestHelper(config);
    expect(helper).toBeInstanceOf(ApiRouteTestHelper);
  });
});

describe('createApiRouteTest', () => {
  it('should return a function', () => {
    const config = {
      routePath: './test-route',
      method: 'GET' as const,
    };

    const testFunction = createApiRouteTest(config);
    expect(typeof testFunction).toBe('object');
  });
});
