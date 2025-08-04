import { NextResponse } from 'next/server';
import { appConfig } from '@/config/app';
import logger from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { testRedisConnection } from '@/lib/redis';

// Track previous health states to only log changes
// eslint-disable-next-line prefer-const
let previousHealthStates = {
  database: null as boolean | null,
  redis: null as boolean | null,
  authService: null as boolean | null,
};

// Track last HTTP status to only log status changes
let lastHealthStatus: number | null = null;

export async function GET() {
  const startTime = Date.now();
  const healthChecks = {
    database: false,
    redis: false,
    authService: false,
  };

  try {
    // Database health check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthChecks.database = true;
      if (previousHealthStates.database !== true) {
        logger.debug('Database health check passed');
        previousHealthStates.database = true;
      }
    } catch (error) {
      if (previousHealthStates.database !== false) {
        logger.error('Database health check failed:', error);
        previousHealthStates.database = false;
      }
    }

    // Redis health check
    try {
      healthChecks.redis = await testRedisConnection();
      if (healthChecks.redis) {
        if (previousHealthStates.redis !== true) {
          logger.debug('Redis health check passed');
          previousHealthStates.redis = true;
        }
      } else {
        if (previousHealthStates.redis !== false) {
          logger.warn('Redis health check failed');
          previousHealthStates.redis = false;
        }
      }
    } catch (error) {
      if (previousHealthStates.redis !== false) {
        logger.error('Redis health check error:', error);
        previousHealthStates.redis = false;
      }
    }

    // Auth service health check with retry logic
    if (appConfig.authServiceUrl) {
      let authServiceHealthy = false;
      const maxRetries = 2;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(`${appConfig.authServiceUrl}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000), // Reduced timeout to 3 seconds
          });

          if (response.ok) {
            authServiceHealthy = true;
            logger.debug('Auth service health check passed');
            previousHealthStates.authService = true;
            break;
          } else {
            if (attempt === maxRetries && previousHealthStates.authService !== false) {
              logger.warn(`Auth service health check failed (attempt ${attempt}/${maxRetries}):`, response.status);
              previousHealthStates.authService = false;
            }
          }
        } catch (error) {
          if (attempt === maxRetries && previousHealthStates.authService !== false) {
            logger.warn(`Auth service health check error (attempt ${attempt}/${maxRetries}):`, error);
            previousHealthStates.authService = false;
          }
        }

        // Wait before retry (only if not the last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      healthChecks.authService = authServiceHealthy;
    } else {
      // Auth service not configured, mark as healthy
      healthChecks.authService = true;
      if (previousHealthStates.authService !== true) {
        previousHealthStates.authService = true;
      }
    }

    // Determine overall health status - only fail if critical services (database/redis) are down
    const criticalServicesHealthy = healthChecks.database && healthChecks.redis;
    const allChecksPassed = Object.values(healthChecks).every(check => check);
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: criticalServicesHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: appConfig.environment,
      version: appConfig.version,
      responseTime,
      checks: healthChecks,
    };

    // Return 200 if critical services are healthy, 503 only if they're not
    const statusCode = criticalServicesHealthy ? 200 : 503;

    // Only log HTTP status changes
    if (lastHealthStatus !== statusCode) {
      if (statusCode === 200) {
        logger.info('Health check endpoint now returning 200 (healthy)');
      } else {
        logger.warn(`Health check endpoint now returning ${statusCode} (unhealthy)`);
      }
      lastHealthStatus = statusCode;
    }

    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed:', error);

    const errorStatusCode = 503;
    if (lastHealthStatus !== errorStatusCode) {
      logger.warn(`Health check endpoint now returning ${errorStatusCode} (error)`);
      lastHealthStatus = errorStatusCode;
    }

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime,
        checks: healthChecks,
      },
      { status: errorStatusCode }
    );
  }
}
