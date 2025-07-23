import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { validateRequest } from '@/lib/validation';
import { tokenUsageStatsSchema } from '@/lib/validation/token-usage';

interface DailyBreakdownItem {
  date: Date;
  promptTokens: string | number;
  completionTokens: string | number;
  requests: string | number;
}

/**
 * Retrieve comprehensive token usage statistics with filtering options.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const model = searchParams.get('model');

    // Validate query parameters
    const validation = validateRequest(tokenUsageStatsSchema, {
      period: period || 'all',
      model: model || undefined,
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

    const { period: periodFilter, model: modelFilter } = validation.data;

    const whereClause: Record<string, unknown> = {};

    // Apply time-based filtering for different periods
    if (periodFilter === 'today') {
      whereClause.createdAt = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    } else if (periodFilter === 'week') {
      whereClause.createdAt = {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      };
    } else if (periodFilter === 'month') {
      whereClause.createdAt = {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      };
    }

    // Apply model-specific filtering when specified
    if (modelFilter) {
      whereClause.model = modelFilter;
    }

    // Calculate aggregate token usage statistics
    const totalUsage = await prisma.tokenUsage.aggregate({
      where: whereClause,
      _sum: {
        promptTokens: true,
        completionTokens: true,
      },
      _count: {
        id: true,
      },
    });

    // Retrieve daily token usage breakdown for the last 30 days
    const dailyBreakdown = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "createdAt") as date,
        SUM("promptTokens") as promptTokens,
        SUM("completionTokens") as completionTokens,
        COUNT(*) as requests
      FROM "TokenUsage"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    // Calculate token usage statistics grouped by model
    const modelBreakdown = await prisma.tokenUsage.groupBy({
      by: ['model'],
      where: whereClause,
      _sum: {
        promptTokens: true,
        completionTokens: true,
      },
      _count: {
        id: true,
      },
    });

    logger.info('Token usage stats retrieved', {
      period: periodFilter,
      model: modelFilter,
      totalRequests: totalUsage._count.id || 0,
      totalPromptTokens: totalUsage._sum.promptTokens || 0,
      totalCompletionTokens: totalUsage._sum.completionTokens || 0,
    });

    return NextResponse.json({
      success: true,
      period: periodFilter,
      model: modelFilter,
      total: {
        requests: Number(totalUsage._count.id) || 0,
        promptTokens: Number(totalUsage._sum.promptTokens) || 0,
        completionTokens: Number(totalUsage._sum.completionTokens) || 0,
      },
      dailyBreakdown: (dailyBreakdown as DailyBreakdownItem[]).map(item => ({
        date: item.date,
        promptTokens: Number(item.promptTokens),
        completionTokens: Number(item.completionTokens),
        requests: Number(item.requests),
      })),
      modelBreakdown: modelBreakdown.map(item => ({
        model: item.model,
        requests: Number(item._count.id),
        promptTokens: Number(item._sum.promptTokens),
        completionTokens: Number(item._sum.completionTokens),
      })),
    });
  } catch (error) {
    logger.error('Token usage stats error', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get token usage statistics',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
