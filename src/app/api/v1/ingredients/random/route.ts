import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * Get random ingredients from the database
 */
export async function GET() {
  try {
    // Get a random number between 4 and 6
    const count = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6

    // Use raw query to get truly random ingredients
    const randomIngredients = await prisma.$queryRaw`
      SELECT id, name, category
      FROM "Ingredient"
      WHERE "isActive" = true
      ORDER BY RANDOM()
      LIMIT ${count}
    `;

    logger.info('Random ingredients fetched', {
      count: (randomIngredients as unknown[]).length,
    });

    return NextResponse.json({
      success: true,
      ingredients: randomIngredients,
    });
  } catch (error) {
    logger.error('Random ingredients fetch error', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch random ingredients',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
