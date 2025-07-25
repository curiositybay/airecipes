import mocks from '../test-utils/mocks/mocks';

// Mock winston before importing the module.
jest.mock('winston', () => ({
  createLogger: jest.fn(() => mocks.mock.logger.instance),
  transports: {
    Console: jest.fn(),
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
}));

import logger from './logger';

describe('logger (Winston instance)', () => {
  it('should log messages', () => {
    const error = new Error('Test error');
    logger.error('Error message', { error });
    expect(mocks.mock.logger.instance.error).toHaveBeenCalledWith(
      'Error message',
      {
        error,
      }
    );
  });
});
