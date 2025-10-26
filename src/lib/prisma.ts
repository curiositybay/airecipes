import { PrismaClient } from '@prisma/client';
import { appConfig } from '@/config/app';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (appConfig.environment !== 'production') globalForPrisma.prisma = prisma;
