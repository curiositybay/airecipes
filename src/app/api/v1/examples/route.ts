import { NextRequest, NextResponse } from 'next/server';
import { getExamples, createExample } from './exampleUtils';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import {
  createExampleSchema,
  validateRequest,
} from '@/lib/validation';

export async function GET() {
  try {
    const result = await getExamples(prisma);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching examples', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch examples',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(createExampleSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }
    const { name, description } = validation.data;
    const result = await createExample(prisma, name, description);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Error creating example', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create example',
      },
      { status: 500 }
    );
  }
}
