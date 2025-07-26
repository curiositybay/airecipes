import winston from 'winston';

import logger from './logger';

describe('logger (Winston instance)', () => {
  it('should log messages', () => {
    const error = new Error('Test error');
    logger.error('Error message', { error });
    expect(winston.createLogger().error).toHaveBeenCalledWith('Error message', {
      error,
    });
  });
});
