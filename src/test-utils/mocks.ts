export const mockPrismaClient = {
  example: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  usageLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  ingredient: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
};

export const mockNextResponse = {
  json: jest.fn((data, opts) => ({
    json: () => Promise.resolve(data),
    status: opts?.status || 200,
    ...opts,
  })),
};

export const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  verbose: jest.fn(),
  silly: jest.fn(),
};

export const mockValidation = {
  validateRequest: jest.fn(),
  createExampleSchema: {},
  updateExampleSchema: {},
  createUsageLogSchema: {},
};

export const mockPrisma = () => {
  jest.doMock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
  }));
};

export const mockNext = () => {
  jest.mock('next/server', () => ({
    NextResponse: mockNextResponse,
    NextRequest: jest.fn(),
  }));
};

export const mockLoggerModule = () => {
  jest.mock('../lib/logger', () => ({
    __esModule: true,
    default: mockLogger,
  }));
};

export const mockValidationModule = () => {
  jest.mock('../lib/validation', () => mockValidation);
};

export const setupApiMocks = () => {
  mockPrisma();
  mockNext();
  mockLoggerModule();
  mockValidationModule();
};

export const clearApiMocks = () => {
  jest.clearAllMocks();
  return true;
};
