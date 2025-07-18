import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import logger from '@/lib/logger';
import { validateRequest } from '@/lib/validation';
import { ingredientSearchSchema } from '@/lib/validation/ai-meals';

/**
 * Search ingredients using prefix matching with alphabetical ordering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit');
    const category = searchParams.get('category');

    // Validate query parameters
    const validation = validateRequest(ingredientSearchSchema, {
      q: query || '',
      limit: limit || '10',
      category: category || undefined,
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

    const { q, limit: limitNum, category: categoryFilter } = validation.data;

    if (!q || q.trim().length === 0) {
      return NextResponse.json({
        success: true,
        ingredients: [],
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Construct database query filter conditions
    const whereClause: Prisma.IngredientWhereInput = {
      isActive: true,
      name: { startsWith: searchTerm },
    };

    // Apply category filter when specified in the request
    if (categoryFilter) {
      whereClause.category = categoryFilter;
    }

    // Retrieve ingredients sorted alphabetically by name
    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
      take: limitNum,
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    logger.info('Ingredient search completed', {
      query: searchTerm,
      resultCount: ingredients.length,
      limit: limitNum,
      category: categoryFilter,
    });

    return NextResponse.json({
      success: true,
      ingredients,
    });
  } catch (error) {
    logger.error('Ingredient search error', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search ingredients',
        details:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
