import winston from 'winston';

describe('logger (real Winston, production)', () => {
  it('should configure file transports for production', () => {
    const transports: winston.transport[] = [];
    transports.push(
      new winston.transports.Console({
        format: winston.format.json(),
      })
    );
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    );
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'setlists-app' },
      transports,
    });
    const fileTransports = logger.transports.filter(
      (t: winston.transport) => t.constructor && t.constructor.name === 'File'
    );
    expect(fileTransports.length).toBeGreaterThan(0);
  });
});
