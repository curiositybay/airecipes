import logger from './middleware-logger';
import mocks from '@/test-utils/mocks/mocks';

// Mock console methods.
const originalConsole = { ...console };
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('middleware-logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
    mocks.setup.all();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  describe('logger methods', () => {
    it('should call console.debug when logging debug message in development', () => {
      const message = 'Test debug message';
      const meta = { debug: 'info' };

      logger.debug(message, meta);

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: Test debug message')
      );
    });

    it('should include metadata in log messages', () => {
      const message = 'Test message';
      const meta = { userId: '123', action: 'test', nested: { value: 'test' } };

      logger.info(message, meta);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(
          '{"userId":"123","action":"test","nested":{"value":"test"}}'
        )
      );
    });

    it('should handle messages without metadata', () => {
      const message = 'Test message without metadata';

      logger.info(message);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test message without metadata$/
        )
      );
    });

    it('should include timestamp in log messages', () => {
      const message = 'Test message';

      logger.info(message);

      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toMatch(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
      );
    });
  });

  describe('log level filtering', () => {
    it('should respect log level filtering in development', () => {
      // Test that debug messages are logged in development (default).
      logger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that info messages are always logged.
      logger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that warn messages are always logged.
      logger.warn('Warn message');
      expect(mockConsole.warn).toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that error messages are always logged.
      logger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should filter debug messages in production environment', () => {
      // Save original environment.
      const originalEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Set to production.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'production';

      // Reset module to re-evaluate environment.
      jest.resetModules();
      const productionLogger = jest.requireActual(
        './middleware-logger'
      ).default;

      // Test that debug messages are NOT logged in production.
      productionLogger.debug('Debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that info messages are still logged in production.
      productionLogger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that warn messages are still logged in production.
      productionLogger.warn('Warn message');
      expect(mockConsole.warn).toHaveBeenCalled();

      // Clear mocks.
      jest.clearAllMocks();

      // Test that error messages are still logged in production.
      productionLogger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();

      // Restore original environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = originalEnv;
    });

    it('should handle missing environment variable', () => {
      // Save original environment.
      const originalEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Remove environment variable.
      delete process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Reset module to re-evaluate environment.
      jest.resetModules();
      const defaultLogger = jest.requireActual('./middleware-logger').default;

      // Test that debug messages are logged when env var is missing (defaults to development).
      defaultLogger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalled();

      // Restore original environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = originalEnv;
    });

    it('should test metadata handling', () => {
      logger.info('Test with meta', { test: 'data' });
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('{"test":"data"}')
      );

      jest.clearAllMocks();

      logger.info('Test without meta');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.not.stringContaining('{"test":"data"}')
      );
    });

    it('should test shouldLog function directly', () => {
      // Save original environment.
      const originalEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Test development environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'development';
      jest.resetModules();
      const { shouldLog } = jest.requireActual('./middleware-logger');

      // In development, all levels should return true.
      expect(shouldLog('debug')).toBe(true);
      expect(shouldLog('info')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);

      // Test production environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'production';
      jest.resetModules();
      const { shouldLog: prodShouldLog } = jest.requireActual(
        './middleware-logger'
      );

      // In production, debug should return false, others should return true.
      expect(prodShouldLog('debug')).toBe(false);
      expect(prodShouldLog('info')).toBe(true);
      expect(prodShouldLog('warn')).toBe(true);
      expect(prodShouldLog('error')).toBe(true);

      // Restore original environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = originalEnv;
    });

    it('should test logger methods in different environments for complete branch coverage', () => {
      // Save original environment.
      const originalEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Test error-only environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'error-only';
      jest.resetModules();
      const errorOnlyLogger = jest.requireActual('./middleware-logger').default;
      jest.clearAllMocks();

      // Test that debug, info, and warn are NOT logged (negative branches).
      errorOnlyLogger.debug('Debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      errorOnlyLogger.info('Info message');
      expect(mockConsole.info).not.toHaveBeenCalled();

      errorOnlyLogger.warn('Warn message');
      expect(mockConsole.warn).not.toHaveBeenCalled();

      // Only error should be logged (positive branch).
      errorOnlyLogger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();

      // Test staging environment (hits the else branch).
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'staging';
      jest.resetModules();
      const stagingLogger = jest.requireActual('./middleware-logger').default;
      jest.clearAllMocks();

      // Test that debug is NOT logged (negative branch).
      stagingLogger.debug('Debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      // Test that other levels are logged (positive branches).
      stagingLogger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalled();

      stagingLogger.warn('Warn message');
      expect(mockConsole.warn).toHaveBeenCalled();

      stagingLogger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();

      // Restore original environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = originalEnv;
    });

    it('should test logger methods in none environment to hit all negative branches', () => {
      // Save original environment.
      const originalEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT;

      // Set to none environment (should hit all negative branches).
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = 'none';

      // Reset module to re-evaluate environment.
      jest.resetModules();
      const noneLogger = jest.requireActual('./middleware-logger').default;

      // Clear any previous calls.
      jest.clearAllMocks();

      // Test that all levels are NOT logged (all negative branches).
      noneLogger.debug('Debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      noneLogger.info('Info message');
      expect(mockConsole.info).not.toHaveBeenCalled();

      noneLogger.warn('Warn message');
      expect(mockConsole.warn).not.toHaveBeenCalled();

      noneLogger.error('Error message');
      expect(mockConsole.error).not.toHaveBeenCalled();

      // Restore original environment.
      process.env.NEXT_PUBLIC_APP_ENVIRONMENT = originalEnv;
    });
  });
});
