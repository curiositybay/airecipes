// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/components/AIMeals/AIMealsPage', () => {
  return function MockAIMealsPage() {
    return <div data-testid='ai-meals-page'>AI Meals Page</div>;
  };
});

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({
    children,
    initialUser,
  }: {
    children: React.ReactNode;
    initialUser: unknown;
  }) => (
    <div data-testid='auth-provider' data-user={JSON.stringify(initialUser)}>
      {children}
    </div>
  ),
}));

jest.mock('@/config/app', () => ({
  appConfig: {
    name: 'Test App',
    authServiceUrl: 'http://test.com',
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Home Page', () => {
  const mockCookies = jest.mocked(jest.requireMock('next/headers').cookies);

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('should export metadata', async () => {
    const page = await import('./page');
    expect(page.metadata).toBeDefined();
    expect(page.metadata).toHaveProperty('title');
    expect(page.metadata).toHaveProperty('description');
  });

  it('should export dynamic configuration', async () => {
    const page = await import('./page');
    expect(page.dynamic).toBe('force-dynamic');
  });

  describe('Home component', () => {
    it('should render with null user when no auth token', async () => {
      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
    });

    it('should render with user when valid auth token', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'valid.jwt.token';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: mockToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          user: mockUser,
        }),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/v1/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ app_name: 'airecipes' }),
        }
      );
    });
  });

  describe('getServerSideUser function', () => {
    it('should return null when no auth token', async () => {
      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
    });

    it('should return null when auth token is expired', async () => {
      const expiredToken = 'header.eyJleHAiOjE2MDAwMDAwMDB9.signature';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: expiredToken }),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null when auth token has invalid format', async () => {
      const invalidToken = 'invalid-token-format';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: invalidToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return null when auth service returns error', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
    });

    it('should return null when auth service response is not successful', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
        }),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
    });

    it('should return null when auth service response has no user', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          user: null,
        }),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
    });

    it('should return user when auth service returns valid user', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
      const mockUser = { id: '123', email: 'test@example.com' };

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          user: mockUser,
        }),
      });

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toEqual(mockUser);
    });

    it('should return null when fetch throws an error', async () => {
      const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';

      mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: validToken }),
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Server-side auth check error:',
        expect.any(Error)
      );
    });

    it('should return null when cookies() throws an error', async () => {
      mockCookies.mockRejectedValue(new Error('Cookie error'));

      const { default: Home } = await import('./page');
      const result = await Home();

      expect(result.props.initialUser).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Server-side auth check error:',
        expect.any(Error)
      );
    });
  });
});
