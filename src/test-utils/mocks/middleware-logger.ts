export const mockMiddlewareLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

export const mockMiddlewareLoggerModule = () => {
  jest.mock('@/lib/middleware-logger', () => ({
    __esModule: true,
    default: mockMiddlewareLogger,
  }));
};

export const setupMiddlewareLoggerMocks = () => {
  mockMiddlewareLoggerModule();
};
