import { PrismaClient } from '@prisma/client';

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Mock the app config
jest.mock('@/config/app', () => ({
  appConfig: {
    environment: 'test',
  },
}));

describe('prisma', () => {
  let MockPrismaClient: jest.MockedClass<typeof PrismaClient>;
  let originalGlobal: typeof globalThis;

  beforeEach(() => {
    jest.clearAllMocks();
    MockPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>;

    // Store original global and reset it
    originalGlobal = globalThis;
    (globalThis as unknown as { prisma?: PrismaClient }).prisma = undefined;
  });

  afterEach(() => {
    // Restore original global
    (globalThis as { prisma?: PrismaClient }).prisma = originalGlobal.prisma;
  });

  it('should create a new PrismaClient instance when global.prisma is undefined', async () => {
    // Import the module to trigger the initialization
    const { prisma } = await import('./prisma');

    expect(MockPrismaClient).toHaveBeenCalledTimes(1);
    expect(prisma).toBeInstanceOf(MockPrismaClient);
  });

  it('should not set global.prisma in production environment', async () => {
    // Mock production environment
    jest.doMock('@/config/app', () => ({
      appConfig: {
        environment: 'production',
      },
    }));

    // Clear the mock and re-import
    jest.resetModules();
    await import('./prisma');

    expect(
      (globalThis as unknown as { prisma?: PrismaClient }).prisma
    ).toBeUndefined();
  });
});
