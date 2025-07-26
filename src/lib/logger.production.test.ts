import winston from 'winston';

// Mock appConfig for production environment
jest.mock('../config/app', () => ({
  appConfig: {
    environment: 'production',
  },
}));

describe('logger (production environment)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add file transports in production', async () => {
    // Import the logger module - this will execute the production code
    await import('./logger');

    expect(winston.transports.File).toHaveBeenCalledWith({
      filename: 'logs/error.log',
      level: 'error',
    });
    expect(winston.transports.File).toHaveBeenCalledWith({
      filename: 'logs/combined.log',
    });
  });
});
