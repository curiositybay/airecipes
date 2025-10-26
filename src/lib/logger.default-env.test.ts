import winston from 'winston';

// Mock appConfig with no environment
jest.mock('@/config/app', () => ({
  appConfig: {
    // environment intentionally omitted
  },
}));

describe('logger (default environment fallback)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default to development environment if not set', async () => {
    await import('./logger');
    expect(winston.transports.Console).toHaveBeenCalled();
    // Optionally, check that the logger is created with 'debug' level
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' })
    );
  });
});
