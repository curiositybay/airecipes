import { NextResponse } from 'next/server';
import { appConfig } from '@/config/app';
import logger from '@/lib/logger';

export async function GET() {
  try {
    // Basic health check - you can add more sophisticated checks here.
    // Such as database connectivity, external service availability, etc.

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: appConfig.environment,
      version: appConfig.version,
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    logger.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
