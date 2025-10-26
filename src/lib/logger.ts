import winston from 'winston';
import { appConfig } from '@/config/app';

const environment = appConfig.environment || 'development';

const transports: winston.transport[] = [];

transports.push(
  new winston.transports.Console({
    format:
      environment === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
  })
);

if (environment === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = winston.createLogger({
  level: environment === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: appConfig.appSlug },
  transports,
});

export default logger;
