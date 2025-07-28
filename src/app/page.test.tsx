import mocks from '@/test-utils/mocks/mocks';

// Setup mocks before importing any modules.
mocks.setup.all();

// Mock Next.js modules that are used in the page component.
jest.mock('next/headers', () => ({
  __esModule: true,
  cookies: jest.fn(),
}));

// Mock console.error to avoid noise in tests.
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.setup.clear();
    mocks.setup.all();
  });

  it('should export required configurations', async () => {
    const page = await import('./page');
    expect(page.metadata).toBeDefined();
    expect(page.metadata).toHaveProperty('title');
    expect(page.metadata).toHaveProperty('description');
    expect(page.dynamic).toBe('force-dynamic');
  });

  describe('Home component', () => {
    it('should handle authentication scenarios', async () => {
      const { cookies } = await import('next/headers');

      // Test no auth token
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      });

      const { default: Home } = await import('./page');
      let result = await Home();
      expect(result.props.initialUser).toBeNull();

      // Test valid auth token
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'valid.jwt.token';

      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: mockToken }),
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          user: mockUser,
        }),
      };
      mocks.mock.http.fetchSuccess(mockResponse);

      result = await Home();
      expect(result.props.initialUser).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getServerSideUser function', () => {
    it('should handle various authentication scenarios', async () => {
      const { default: Home } = await import('./page');
      const { cookies } = await import('next/headers');

      // Test expired token
      const expiredToken = 'header.eyJleHAiOjE2MDAwMDAwMDB9.signature';
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: expiredToken }),
      });
      let result = await Home();
      expect(result.props.initialUser).toBeNull();

      // Test invalid token format
      const invalidToken = 'invalid-token-format';
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: invalidToken }),
      });
      mocks.mock.http.fetchSuccess(mocks.mock.http.mockFetchErrorResponse);
      result = await Home();
      expect(result.props.initialUser).toBeNull();

      // Test auth service error
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });
      mocks.mock.http.fetchSuccess(mocks.mock.http.mockFetchErrorResponse);
      result = await Home();
      expect(result.props.initialUser).toBeNull();

      // Test network error
      mocks.mock.http.fetchFailure(new Error('Network error'));
      result = await Home();
      expect(result.props.initialUser).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle missing or invalid user in successful response', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
      const { cookies } = await import('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });
      // Case 1: success false
      let mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: false }),
      };
      mocks.mock.http.fetchSuccess(mockResponse);
      let { default: Home } = await import('./page');
      let result = await Home();
      expect(result.props.initialUser).toBeNull();
      // Case 2: user null
      mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, user: null }),
      };
      mocks.mock.http.fetchSuccess(mockResponse);
      ({ default: Home } = await import('./page'));
      result = await Home();
      expect(result.props.initialUser).toBeNull();
    });

    it('should handle cookie errors', async () => {
      const { cookies } = await import('next/headers');
      cookies.mockRejectedValue(new Error('Cookie error'));

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
