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
    it('should call console.debug when logging debug message in development', async () => {
      // Set environment to development for this test
      mocks.mock.config.updateMockConfig({ environment: 'development' });

      // Import logger after mocks are set up
      const { default: logger } = await import('./middleware-logger');

      // Debug: Check what environment is being used
      const { appConfig } = await import('@/config/app');
      console.log('Current environment:', appConfig.environment);
      console.log(
        'Mock config environment:',
        mocks.mock.config.app.environment
      );

      const message = 'Test debug message';
      const meta = { debug: 'info' };

      logger.debug(message, meta);

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: Test debug message')
      );
    });
  });

  describe('log level filtering', () => {
    it('should test shouldLog function directly', () => {
      // Save original environment.
      const originalEnv = mocks.mock.config.app.environment;

      // Test development environment.
      mocks.mock.config.updateMockConfig({ environment: 'development' });
      jest.resetModules();
      const { shouldLog } = jest.requireActual('./middleware-logger');

      // In development, all levels should return true.
      expect(shouldLog('debug')).toBe(true);
      expect(shouldLog('info')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('error')).toBe(true);

      // Test production environment.
      mocks.mock.config.updateMockConfig({ environment: 'production' });
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
      mocks.mock.config.updateMockConfig({ environment: originalEnv });
    });

    it('should test logger methods in different environments for complete branch coverage', () => {
      // Save original environment.
      const originalEnv = mocks.mock.config.app.environment;

      // Test error-only environment.
      mocks.mock.config.updateMockConfig({ environment: 'error-only' });
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
      mocks.mock.config.updateMockConfig({ environment: 'staging' });
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
      mocks.mock.config.updateMockConfig({ environment: originalEnv });
    });

    it('should test logger methods in none environment to hit all negative branches', () => {
      // Save original environment.
      const originalEnv = mocks.mock.config.app.environment;

      // Set to none environment (should hit all negative branches).
      mocks.mock.config.updateMockConfig({ environment: 'none' });

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
      mocks.mock.config.updateMockConfig({ environment: originalEnv });
    });
  });
});
