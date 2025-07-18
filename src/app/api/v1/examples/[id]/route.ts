import { NextRequest, NextResponse } from 'next/server';
import { updateExample, deleteExample } from '../exampleUtils';
import { prisma } from '../../../../../lib/prisma';
import logger from '../../../../../lib/logger';
import {
  updateExampleSchema,
  validateRequest,
} from '../../../../../lib/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = validateRequest(updateExampleSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }
    const result = await updateExample(prisma, parseInt(id), validation.data);
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error updating example', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update example',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteExample(prisma, parseInt(id));
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error deleting example', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete example',
      },
      { status: 500 }
    );
  }
}
