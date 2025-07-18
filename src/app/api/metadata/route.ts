import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const metadata = await prisma.appMetadata.findFirst({
      orderBy: {
        lastDeployed: 'desc',
      },
    });

    if (!metadata) {
      return NextResponse.json(
        {
          error: 'No metadata found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appVersion: metadata.appVersion,
      apiVersion: metadata.apiVersion,
      lastDeployed: metadata.lastDeployed,
    });
  } catch (error) {
    console.error('Failed to fetch metadata:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch metadata',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
