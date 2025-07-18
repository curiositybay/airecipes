import { PrismaClient } from '@prisma/client';

export async function updateExample(
  prisma: PrismaClient,
  id: number,
  data: Record<string, unknown>
) {
  const example = await prisma.example.update({
    where: { id },
    data,
  });
  return {
    success: true,
    data: example,
  };
}

export async function deleteExample(prisma: PrismaClient, id: number) {
  await prisma.example.delete({ where: { id } });
  return { success: true };
}

export async function getExamples(prisma: PrismaClient) {
  const examples = await prisma.example.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return {
    success: true,
    data: examples,
    count: examples.length,
  };
}

export async function createExample(
  prisma: PrismaClient,
  name: string,
  description?: string
) {
  const example = await prisma.example.create({
    data: { name, description },
  });
  return {
    success: true,
    data: example,
  };
}
