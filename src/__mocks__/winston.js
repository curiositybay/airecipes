const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn(),
};

const mockConsoleTransport = jest.fn();
const mockFileTransport = jest.fn();

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

module.exports = mockWinston;
