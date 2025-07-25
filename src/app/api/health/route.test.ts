import mocks from '../../../test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

// Mock process.uptime using the mock architecture.
jest.spyOn(process, 'uptime').mockReturnValue(mocks.mock.process.uptime());

// Mock Date to return a predictable timestamp.
const mockDate = new Date('2023-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

describe('api/health/route', () => {
  let GET: () => Promise<Response>;

  beforeEach(() => {
    jest.resetModules();
    mocks.setup.all();
    // Import the route after mocks.
    ({ GET } = jest.requireActual('./route'));
  });

  afterEach(() => {
    mocks.setup.clear();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns healthy status on success', async () => {
      expect(GET).toBeDefined();
      const response = await GET();
      const data = await response.json();

      expect(mocks.mock.next.mockNextResponse.json).toHaveBeenCalledWith(
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
      // Mock Date constructor to throw an error to trigger the catch block.
      const originalDate = global.Date;
      global.Date = jest.fn().mockImplementation(() => {
        throw new Error('Some error'); // generic error
      }) as jest.MockedFunction<typeof Date>;

      try {
        // The error should be thrown when the route tries to create a timestamp.
        await expect(GET()).rejects.toThrow();

        // Verify that logger.error was called with any error.
        expect(mocks.mock.logger.instance.error).toHaveBeenCalledWith(
          'Health check failed:',
          expect.any(Error)
        );
      } finally {
        // Restore Date.
        global.Date = originalDate;
      }
    });
  });
});
