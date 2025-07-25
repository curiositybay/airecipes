import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { validateRequest } from '@/lib/validation';
import { tokenUsageRecentSchema } from '@/lib/validation/token-usage';
import { appConfig } from '@/config/app';

/**
 * Retrieve recent token usage entries with configurable limit.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // Validate query parameters
    const validation = validateRequest(tokenUsageRecentSchema, {
      limit: limit || '50',
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { limit: limitNum } = validation.data;

    const recentUsage = await prisma.tokenUsage.findMany({
      take: limitNum,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        method: true,
        model: true,
        promptTokens: true,
        completionTokens: true,
        success: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    logger.info('Recent token usage retrieved', {
      limit: limitNum,
      count: recentUsage.length,
    });

    return NextResponse.json({
      success: true,
      recentUsage,
    });
  } catch (error) {
    logger.error('Recent token usage error', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recent token usage',
        details:
          appConfig.nodeEnv === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
