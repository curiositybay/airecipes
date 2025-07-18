import { mockLogger } from '../test-utils/mocks';

// Mock winston before any imports
const mockConsoleTransport = jest.fn();
const mockWinston = {
  createLogger: jest.fn(() => mockLogger),
  transports: {
    Console: mockConsoleTransport,
    File: jest.fn(),
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

// Mock appConfig with no environment
jest.mock('../config/app', () => ({
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
    expect(mockConsoleTransport).toHaveBeenCalled();
    // Optionally, check that the logger is created with 'debug' level
    expect(mockWinston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' })
    );
  });
});
