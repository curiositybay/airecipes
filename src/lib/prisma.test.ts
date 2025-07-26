import mocks from '../test-utils/mocks/mocks';

// Setup mocks before importing anything.
mocks.setup.all();

describe('prisma (mocked)', () => {
  let mockPrismaClient: typeof mocks.mock.prisma.client;

  beforeEach(() => {
    mockPrismaClient = mocks.mock.prisma.client;
  });

  it('should have the expected PrismaClient methods', () => {
    expect(mockPrismaClient).toHaveProperty('$connect');
    expect(mockPrismaClient).toHaveProperty('$disconnect');
    expect(mockPrismaClient).toHaveProperty('$transaction');
    expect(mockPrismaClient).toHaveProperty('example');
    expect(mockPrismaClient).toHaveProperty('usageLog');
  });

  it('should have example model methods', () => {
    expect(mockPrismaClient.example).toHaveProperty('findMany');
    expect(mockPrismaClient.example).toHaveProperty('create');
    expect(mockPrismaClient.example).toHaveProperty('update');
    expect(mockPrismaClient.example).toHaveProperty('delete');
    expect(mockPrismaClient.example).toHaveProperty('findUnique');
  });

  it('should have usageLog model methods', () => {
    expect(mockPrismaClient.usageLog).toHaveProperty('findMany');
    expect(mockPrismaClient.usageLog).toHaveProperty('create');
    expect(mockPrismaClient.usageLog).toHaveProperty('count');
    expect(mockPrismaClient.usageLog).toHaveProperty('findUnique');
    expect(mockPrismaClient.usageLog).toHaveProperty('update');
    expect(mockPrismaClient.usageLog).toHaveProperty('delete');
  });

  it('should have tokenUsage model methods', () => {
    expect(mockPrismaClient.tokenUsage).toHaveProperty('findMany');
    expect(mockPrismaClient.tokenUsage).toHaveProperty('create');
    expect(mockPrismaClient.tokenUsage).toHaveProperty('aggregate');
    expect(mockPrismaClient.tokenUsage).toHaveProperty('groupBy');
  });

  it('should have appMetadata model methods', () => {
    expect(mockPrismaClient.appMetadata).toHaveProperty('findMany');
    expect(mockPrismaClient.appMetadata).toHaveProperty('create');
    expect(mockPrismaClient.appMetadata).toHaveProperty('findFirst');
  });
});
