import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

// Mock the appConfig to control the environment
jest.mock('../config/app', () => ({
  appConfig: {
    environment: 'development',
  },
}));

describe('prisma', () => {
  it('should create a new PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma).toBeInstanceOf(PrismaClient);
  });

  it('should have the expected PrismaClient methods', () => {
    expect(prisma).toHaveProperty('$connect');
    expect(prisma).toHaveProperty('$disconnect');
    expect(prisma).toHaveProperty('$transaction');
    expect(prisma).toHaveProperty('example');
    expect(prisma).toHaveProperty('usageLog');
  });

  it('should have example model methods', () => {
    expect(prisma.example).toHaveProperty('findMany');
    expect(prisma.example).toHaveProperty('create');
    expect(prisma.example).toHaveProperty('update');
    expect(prisma.example).toHaveProperty('delete');
    expect(prisma.example).toHaveProperty('findUnique');
  });

  it('should have usageLog model methods', () => {
    expect(prisma.usageLog).toHaveProperty('findMany');
    expect(prisma.usageLog).toHaveProperty('create');
    expect(prisma.usageLog).toHaveProperty('count');
    expect(prisma.usageLog).toHaveProperty('findUnique');
    expect(prisma.usageLog).toHaveProperty('update');
    expect(prisma.usageLog).toHaveProperty('delete');
  });

  it('should attach prisma to global object in non-production environment', () => {
    // The conditional logic should execute in development
    expect((globalThis as { prisma?: PrismaClient }).prisma).toBeDefined();
    expect((globalThis as { prisma?: PrismaClient }).prisma).toBe(prisma);
  });

  it('should not attach prisma to global object in production environment', async () => {
    // Mock production environment
    jest.doMock('../config/app', () => ({
      appConfig: {
        environment: 'production',
      },
    }));

    // Clear the global object
    delete (globalThis as { prisma?: PrismaClient }).prisma;

    // Re-import the module to trigger the conditional logic
    jest.resetModules();
    const { prisma: productionPrisma } = await import('./prisma');

    expect(productionPrisma).toBeDefined();
    expect((globalThis as { prisma?: PrismaClient }).prisma).toBeUndefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
