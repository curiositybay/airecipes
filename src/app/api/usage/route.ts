import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import { createUsageLogSchema, validateRequest } from '../../../lib/validation';
import { getUsageLogs, createUsageLog } from './logic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getUsageLogs(limit, offset);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching usage logs', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usage logs',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateRequest(createUsageLogSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const { method, success, errorMessage } = validation.data;
    const result = await createUsageLog(method, success, errorMessage);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Error creating usage log', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create usage log',
      },
      { status: 500 }
    );
  }
}
