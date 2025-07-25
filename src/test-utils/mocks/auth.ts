// Auth mocks for testing.
export const mockRequireAuth = jest.fn();

export const mockAuthSuccess = {
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  token: 'mock-jwt-token',
};

export const mockAuthFailure = new Error('Authentication failed');

export const setupAuthMocks = () => {
  mockAuthModule();
};

export const mockAuthModule = () => {
  jest.mock('@/lib/auth', () => ({
    requireAuth: mockRequireAuth,
    __esModule: true,
  }));
};
