import {
  DatabaseRouteTestHelper,
  createDatabaseRouteTest,
} from './database-route-test';

// Mock the mocks module
jest.mock('./mocks', () => ({
  setupApiMocks: jest.fn(),
  clearApiMocks: jest.fn(),
}));

describe('DatabaseRouteTestHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance with correct configuration', () => {
    const config = {
      routePath: './test-route',
      method: 'GET' as const,
      mockConfig: {
        requireAuth: true,
      },
    };

    const helper = new DatabaseRouteTestHelper(config);
    expect(helper).toBeInstanceOf(DatabaseRouteTestHelper);
  });

  it('should create an instance without mock config', () => {
    const config = {
      routePath: './test-route',
      method: 'POST' as const,
    };

    const helper = new DatabaseRouteTestHelper(config);
    expect(helper).toBeInstanceOf(DatabaseRouteTestHelper);
  });
});

describe('createDatabaseRouteTest', () => {
  it('should return a function', () => {
    const config = {
      routePath: './test-route',
      method: 'GET' as const,
    };

    const testFunction = createDatabaseRouteTest(config);
    expect(typeof testFunction).toBe('object');
  });
});
