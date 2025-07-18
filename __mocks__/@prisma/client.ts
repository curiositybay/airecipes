export class PrismaClient {
  constructor() {
    // Mock constructor
  }

  example = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  };

  usageLog = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  };

  // Prisma client methods
  $connect = jest.fn();
  $disconnect = jest.fn();
  $transaction = jest.fn();
  $queryRaw = jest.fn();
  $executeRaw = jest.fn();
  $queryRawUnsafe = jest.fn();
  $executeRawUnsafe = jest.fn();
}
