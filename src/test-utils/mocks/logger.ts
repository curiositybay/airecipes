export const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn(),
};

export const mockLoggerModule = () => {
  jest.mock('@/lib/logger', () => ({
    __esModule: true,
    default: mockLogger,
  }));
};

export const setupLoggerMocks = () => {
  mockLoggerModule();
};
