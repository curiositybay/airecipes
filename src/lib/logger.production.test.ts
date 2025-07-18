import { mockLogger } from '../test-utils/mocks';

// Mock winston with spies before any imports
const mockFileTransport = jest.fn();
const mockConsoleTransport = jest.fn();
const mockWinston = {
  createLogger: jest.fn(() => mockLogger),
  transports: {
    Console: mockConsoleTransport,
    File: mockFileTransport,
  },
  format: {
    combine: jest.fn((...args) => args),
    timestamp: jest.fn(() => ({})),
    errors: jest.fn(() => ({})),
    json: jest.fn(() => ({})),
    colorize: jest.fn(() => ({})),
    simple: jest.fn(() => ({})),
    splat: jest.fn(() => ({})),
  },
};

jest.mock('winston', () => mockWinston);

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

    expect(mockFileTransport).toHaveBeenCalledWith({
      filename: 'logs/error.log',
      level: 'error',
    });
    expect(mockFileTransport).toHaveBeenCalledWith({
      filename: 'logs/combined.log',
    });
  });
});
