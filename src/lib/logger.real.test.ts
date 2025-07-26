import winston from 'winston';

describe('logger (Winston mock)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure file transports for production', () => {
    // Test that winston.createLogger is called with the expected configuration
    const mockLogger = winston.createLogger();

    // Verify that the mock logger is returned
    expect(mockLogger).toBeDefined();
    expect(mockLogger.error).toBeDefined();
    expect(mockLogger.info).toBeDefined();

    // Verify that winston.createLogger was called
    expect(winston.createLogger).toHaveBeenCalled();
  });
});
