import { prisma } from '../../../lib/prisma';

export async function getUsageLogs(limit: number, offset: number) {
  const usageLogs = await prisma.usageLog.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
  const total = await prisma.usageLog.count();
  return {
    success: true,
    data: usageLogs,
    pagination: {
      total,
      limit,
      offset,
    },
  };
}

export async function createUsageLog(
  method: string,
  success: boolean,
  errorMessage?: string
) {
  const usageLog = await prisma.usageLog.create({
    data: {
      method,
      success,
      errorMessage: success ? null : errorMessage,
    },
  });
  return {
    success: true,
    data: usageLog,
  };
}
