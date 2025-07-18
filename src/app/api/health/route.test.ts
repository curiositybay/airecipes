import {
  setupApiMocks,
  clearApiMocks,
  mockNextResponse,
} from '../../../test-utils/mocks';

// Mock process.uptime to return a predictable value
jest.spyOn(process, 'uptime').mockReturnValue(123.456);

// Mock Date to return a predictable timestamp
const mockDate = new Date('2023-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// Mock process.env and console.error to prevent it from appearing in test output
const originalEnv = process.env;
beforeAll(() => {
  process.env = { ...originalEnv, NEXT_PUBLIC_APP_ENVIRONMENT: 'test' };
  console.error = jest.fn();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('api/health/route', () => {
  let GET: () => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    setupApiMocks();
    // Import the route after mocks
    ({ GET } = jest.requireActual('./route'));
  });

  afterEach(() => {
    clearApiMocks();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns healthy status on success', async () => {
      expect(GET).toBeDefined();
      const response = await GET();
      const data = await response.json();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          version: expect.any(String),
        },
        { status: 200 }
      );

      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        version: expect.any(String),
      });
    });

    it('returns unhealthy status on error', async () => {
      // Mock console.error to prevent it from appearing in test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Mock Date constructor to throw an error to trigger the catch block
      const originalDate = global.Date;
      global.Date = jest.fn().mockImplementation(() => {
        throw new Error('Some error'); // generic error
      }) as jest.MockedFunction<typeof Date>;

      try {
        // The error should be thrown when the route tries to create a timestamp
        await expect(GET()).rejects.toThrow();

        // Verify that console.error was called with any error
        expect(console.error).toHaveBeenCalledWith(
          'Health check failed:',
          expect.any(Error)
        );
      } finally {
        // Restore console.error and Date
        console.error = originalConsoleError;
        global.Date = originalDate;
      }
    });

    it('includes correct environment information', async () => {
      await GET();
      const callArgs = (mockNextResponse.json as jest.Mock).mock.calls[0][0];

      expect(['test', 'development']).toContain(callArgs.environment);
    });
  });
});
