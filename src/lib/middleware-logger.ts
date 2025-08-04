// Middleware-compatible logger that doesn't use Node.js APIs.
import { appConfig } from '@/config/app';

interface LogLevel {
  debug: number;
  info: number;
  warn: number;
  error: number;
}

const LOG_LEVELS: LogLevel = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getCurrentLevel(): number {
  const environment = appConfig.environment;

  if (environment === 'development') {
    return LOG_LEVELS.debug;
  } else if (environment === 'error-only') {
    return LOG_LEVELS.error;
  } else if (environment === 'none') {
    return 999; // Higher than any log level.
  } else {
    return LOG_LEVELS.info;
  }
}

function shouldLog(level: keyof LogLevel): boolean {
  return LOG_LEVELS[level] >= getCurrentLevel();
}

// Export for testing.
export { shouldLog };

function formatMessage(
  level: string,
  message: string,
  meta?: Record<string, unknown>
): string {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta) {
    metaStr = ` ${JSON.stringify(meta)}`;
  }
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

const middlewareLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, meta));
    }
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },
};

export default middlewareLogger;
